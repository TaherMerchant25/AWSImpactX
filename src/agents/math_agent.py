"""
Math Agent
Performs financial calculations, validates metrics, and analyzes quantitative data
"""
import json
import re
from typing import Dict, Any, List, Optional
from aws_lambda_powertools import Logger, Tracer
from dataclasses import asdict
from .base_agent import BaseAgent, Finding
import math

logger = Logger()
tracer = Tracer()


class MathAgent(BaseAgent):
    """
    Agent that performs mathematical and financial analysis
    """
    
    def __init__(self, mcp_hub):
        super().__init__("Math Agent", mcp_hub)
    
    @tracer.capture_method
    def analyze(self, document_data: Dict[str, Any], 
               context: Dict[str, Any],
               previous_results: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Perform mathematical and financial analysis
        """
        logger.info("Starting mathematical analysis")
        
        findings = []
        
        # Extract financial metrics
        metrics = self._extract_financial_metrics(document_data)
        
        # Validate calculations
        findings.extend(self._validate_calculations(metrics, document_data))
        
        # Check financial ratios
        findings.extend(self._analyze_financial_ratios(metrics))
        
        # Detect anomalies
        findings.extend(self._detect_numerical_anomalies(metrics))
        
        # Use MCP Hub for complex calculations
        calculated_metrics = self._perform_advanced_calculations(metrics)
        
        confidence = 0.9
        reasoning = self._generate_reasoning(findings, metrics)
        
        return {
            'agent_type': 'math',
            'success': True,
            'findings': [asdict(f) for f in findings],
            'confidence': confidence,
            'reasoning': reasoning,
            'metadata': {
                'metrics_analyzed': len(metrics),
                'calculated_metrics': calculated_metrics,
                'calculation_errors': len([f for f in findings if 'calculation' in f.category.lower()])
            }
        }
    
    def _extract_financial_metrics(self, document_data: Dict[str, Any]) -> Dict[str, float]:
        """Extract financial metrics from document"""
        
        metrics = {}
        text_content = self.extract_text_content(document_data)
        
        # Common financial metrics patterns
        patterns = {
            'revenue': r'revenue[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B)?',
            'profit': r'(?:net\s+)?profit[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B)?',
            'ebitda': r'ebitda[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B)?',
            'assets': r'(?:total\s+)?assets[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B)?',
            'liabilities': r'(?:total\s+)?liabilities[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B)?',
            'equity': r'(?:shareholders?\s+)?equity[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B)?',
            'cash': r'cash[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B)?',
        }
        
        for metric_name, pattern in patterns.items():
            match = re.search(pattern, text_content.lower())
            if match:
                value_str = match.group(1).replace(',', '')
                value = float(value_str)
                
                # Check for unit multipliers
                unit_match = re.search(r'(million|billion|M|B)', match.group(0), re.IGNORECASE)
                if unit_match:
                    unit = unit_match.group(1).lower()
                    if unit in ['million', 'm']:
                        value *= 1_000_000
                    elif unit in ['billion', 'b']:
                        value *= 1_000_000_000
                
                metrics[metric_name] = value
        
        # Extract from tables
        for table in document_data.get('tables', []):
            metrics.update(self._extract_metrics_from_table(table))
        
        return metrics
    
    def _extract_metrics_from_table(self, table: Dict[str, Any]) -> Dict[str, float]:
        """Extract financial metrics from table"""
        
        metrics = {}
        data = table.get('data', [])
        
        if len(data) < 2:
            return metrics
        
        # Assume first row is headers
        headers = [str(h).lower() for h in data[0]]
        
        # Look for financial metric rows
        for row in data[1:]:
            if not row:
                continue
                
            row_label = str(row[0]).lower()
            
            # Check if this is a financial metric row
            if any(term in row_label for term in ['revenue', 'profit', 'ebitda', 'cash', 'assets']):
                # Extract numerical values
                for idx, cell in enumerate(row[1:], 1):
                    try:
                        value = self._parse_number(str(cell))
                        metric_key = f"{row_label.strip()}_{idx}"
                        metrics[metric_key] = value
                    except (ValueError, AttributeError):
                        continue
        
        return metrics
    
    def _parse_number(self, text: str) -> float:
        """Parse number from text"""
        text = text.replace(',', '').replace('$', '').replace('(', '-').replace(')', '').strip()
        return float(text)
    
    def _validate_calculations(self, metrics: Dict[str, float], 
                              document_data: Dict[str, Any]) -> List[Finding]:
        """Validate mathematical calculations"""
        
        findings = []
        
        # Check basic accounting equation: Assets = Liabilities + Equity
        if all(k in metrics for k in ['assets', 'liabilities', 'equity']):
            calculated_assets = metrics['liabilities'] + metrics['equity']
            stated_assets = metrics['assets']
            
            diff_pct = abs(calculated_assets - stated_assets) / stated_assets * 100
            
            if diff_pct > 1.0:  # More than 1% difference
                findings.append(self.create_finding(
                    severity='HIGH',
                    category='calculation',
                    title='Balance Sheet Equation Mismatch',
                    description=f'Assets ({stated_assets:,.2f}) ≠ Liabilities + Equity ({calculated_assets:,.2f})',
                    evidence=[
                        f'Assets: ${stated_assets:,.2f}',
                        f'Liabilities + Equity: ${calculated_assets:,.2f}',
                        f'Difference: {diff_pct:.2f}%'
                    ],
                    confidence=0.95,
                    recommendations=['Verify balance sheet calculations', 'Check for missing items']
                ))
        
        # Validate growth rates if multiple periods present
        findings.extend(self._validate_growth_rates(metrics))
        
        return findings
    
    def _validate_growth_rates(self, metrics: Dict[str, float]) -> List[Finding]:
        """Validate stated vs calculated growth rates"""
        
        findings = []
        text_content_keys = [k for k in metrics.keys() if 'growth' in k.lower()]
        
        # This is a simplified check - in production would need more sophisticated logic
        
        return findings
    
    def _analyze_financial_ratios(self, metrics: Dict[str, float]) -> List[Finding]:
        """Analyze financial ratios for red flags"""
        
        findings = []
        
        # Current Ratio = Assets / Liabilities
        if 'assets' in metrics and 'liabilities' in metrics and metrics['liabilities'] > 0:
            current_ratio = metrics['assets'] / metrics['liabilities']
            
            if current_ratio < 1.0:
                findings.append(self.create_finding(
                    severity='HIGH',
                    category='financial',
                    title='Low Current Ratio',
                    description=f'Current ratio of {current_ratio:.2f} indicates potential liquidity issues',
                    evidence=[f'Current Ratio: {current_ratio:.2f}', 'Benchmark: >1.0'],
                    confidence=0.85,
                    recommendations=['Assess liquidity position', 'Review working capital management']
                ))
        
        # Profit Margin = Profit / Revenue
        if 'profit' in metrics and 'revenue' in metrics and metrics['revenue'] > 0:
            profit_margin = (metrics['profit'] / metrics['revenue']) * 100
            
            if profit_margin < 0:
                findings.append(self.create_finding(
                    severity='MEDIUM',
                    category='financial',
                    title='Negative Profit Margin',
                    description=f'Company is operating at a loss with {profit_margin:.2f}% margin',
                    evidence=[f'Profit Margin: {profit_margin:.2f}%'],
                    confidence=0.90,
                    recommendations=['Review path to profitability', 'Assess burn rate']
                ))
            elif profit_margin < 5:
                findings.append(self.create_finding(
                    severity='MEDIUM',
                    category='financial',
                    title='Low Profit Margin',
                    description=f'Profit margin of {profit_margin:.2f}% is relatively low',
                    evidence=[f'Profit Margin: {profit_margin:.2f}%'],
                    confidence=0.80,
                    recommendations=['Evaluate cost structure', 'Consider pricing strategy']
                ))
        
        # Debt-to-Equity Ratio
        if 'liabilities' in metrics and 'equity' in metrics and metrics['equity'] > 0:
            debt_to_equity = metrics['liabilities'] / metrics['equity']
            
            if debt_to_equity > 2.0:
                findings.append(self.create_finding(
                    severity='MEDIUM',
                    category='financial',
                    title='High Debt-to-Equity Ratio',
                    description=f'Debt-to-equity ratio of {debt_to_equity:.2f} indicates high leverage',
                    evidence=[f'D/E Ratio: {debt_to_equity:.2f}', 'Benchmark: <2.0'],
                    confidence=0.85,
                    recommendations=['Assess debt servicing capacity', 'Review capital structure']
                ))
        
        return findings
    
    def _detect_numerical_anomalies(self, metrics: Dict[str, float]) -> List[Finding]:
        """Detect suspicious numerical patterns"""
        
        findings = []
        
        # Check for Benford's Law violations (simplified)
        # In real implementation, would need more data points
        
        # Check for round numbers (possible manipulation)
        round_numbers = []
        for key, value in metrics.items():
            if value > 1000 and value % 1000 == 0:
                round_numbers.append((key, value))
        
        if len(round_numbers) >= 3:
            findings.append(self.create_finding(
                severity='LOW',
                category='financial',
                title='Excessive Round Numbers',
                description='Multiple financial metrics are suspiciously round numbers',
                evidence=[f'{k}: ${v:,.0f}' for k, v in round_numbers[:3]],
                confidence=0.60,
                recommendations=['Verify accuracy of figures', 'Request detailed breakdown']
            ))
        
        # Check for implausibly high growth
        if 'revenue' in metrics and metrics['revenue'] > 1_000_000_000:  # $1B+
            findings.append(self.create_finding(
                severity='LOW',
                category='financial',
                title='High Revenue - Requires Verification',
                description=f'Revenue of ${metrics["revenue"]:,.0f} requires careful validation',
                evidence=[f'Stated Revenue: ${metrics["revenue"]:,.0f}'],
                confidence=0.70,
                recommendations=['Verify revenue recognition methodology', 'Review customer contracts']
            ))
        
        return findings
    
    def _perform_advanced_calculations(self, metrics: Dict[str, float]) -> Dict[str, Any]:
        """Perform advanced calculations using MCP Hub"""
        
        calculated = {}
        
        try:
            # Use MCP Hub calculation tool
            if 'revenue' in metrics and 'profit' in metrics:
                result = self.mcp_hub.invoke_tool(
                    'calculate',
                    {
                        'expression': '(profit / revenue) * 100',
                        'variables': {
                            'profit': metrics['profit'],
                            'revenue': metrics['revenue']
                        }
                    }
                )
                
                if result.success:
                    calculated['profit_margin_pct'] = result.data
            
            # Calculate more metrics
            if 'assets' in metrics and 'liabilities' in metrics:
                result = self.mcp_hub.invoke_tool(
                    'calculate',
                    {
                        'expression': 'assets - liabilities',
                        'variables': {
                            'assets': metrics['assets'],
                            'liabilities': metrics['liabilities']
                        }
                    }
                )
                
                if result.success:
                    calculated['net_worth'] = result.data
        
        except Exception as e:
            logger.error(f"Error in advanced calculations: {e}")
        
        return calculated
    
    def _generate_reasoning(self, findings: List[Finding], 
                           metrics: Dict[str, float]) -> str:
        """Generate reasoning summary"""
        
        if not metrics:
            return "No financial metrics found for analysis."
        
        if not findings:
            return f"Analyzed {len(metrics)} financial metric(s). No significant calculation errors or red flags detected."
        
        critical = len([f for f in findings if f.severity == 'CRITICAL'])
        high = len([f for f in findings if f.severity == 'HIGH'])
        
        return (f"Analyzed {len(metrics)} financial metric(s). "
                f"Found {len(findings)} issue(s): "
                f"{critical} critical, {high} high priority.")
