"""
Consistency Agent
Validates data integrity and consistency across the document
"""
import json
import re
from typing import Dict, Any, List
from aws_lambda_powertools import Logger, Tracer
from dataclasses import asdict
from .base_agent import BaseAgent, Finding

logger = Logger()
tracer = Tracer()


class ConsistencyAgent(BaseAgent):
    """
    Agent that checks for internal consistency in documents
    - Cross-references numbers across sections
    - Validates calculations
    - Checks for contradictory statements
    """
    
    def __init__(self, mcp_hub):
        super().__init__("Consistency Agent", mcp_hub)
    
    @tracer.capture_method
    def analyze(self, document_data: Dict[str, Any], 
               context: Dict[str, Any],
               previous_results: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Perform consistency analysis on document
        """
        logger.info("Starting consistency analysis")
        
        findings = []
        
        # Extract all numerical data
        numerical_data = self._extract_numerical_data(document_data)
        
        # Check numerical consistency
        findings.extend(self._check_numerical_consistency(numerical_data, document_data))
        
        # Check for contradictions
        findings.extend(self._check_contradictions(document_data))
        
        # Validate tables for consistency
        findings.extend(self._validate_tables(document_data))
        
        # Calculate overall confidence
        confidence = self._calculate_confidence(findings)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(findings)
        
        return {
            'agent_type': 'consistency',
            'success': True,
            'findings': [asdict(f) for f in findings],
            'confidence': confidence,
            'reasoning': reasoning,
            'metadata': {
                'checks_performed': 3,
                'issues_found': len([f for f in findings if f.severity in ['CRITICAL', 'HIGH']])
            }
        }
    
    def _extract_numerical_data(self, document_data: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """Extract all numerical values with their context"""
        
        numerical_data = {'text': [], 'tables': [], 'forms': []}
        
        # From text content
        text_content = self.extract_text_content(document_data)
        
        # Find numbers with context
        pattern = r'([\w\s]{0,30})\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B|K)?([\w\s]{0,30})'
        matches = re.finditer(pattern, text_content, re.IGNORECASE)
        
        for match in matches:
            context_before = match.group(1).strip()
            value = match.group(2).replace(',', '')
            context_after = match.group(3).strip()
            
            numerical_data['text'].append({
                'value': float(value) if '.' in value else int(value),
                'context_before': context_before,
                'context_after': context_after,
                'raw': match.group(0)
            })
        
        # From tables
        for table in document_data.get('tables', []):
            for row in table.get('data', []):
                for cell in row:
                    if self._is_numeric(cell):
                        numerical_data['tables'].append({
                            'value': self._parse_number(cell),
                            'context': 'table',
                            'raw': cell
                        })
        
        # From forms
        for form in document_data.get('forms', []):
            value = form.get('value', '')
            if self._is_numeric(value):
                numerical_data['forms'].append({
                    'value': self._parse_number(value),
                    'key': form.get('key', ''),
                    'raw': value
                })
        
        return numerical_data
    
    def _is_numeric(self, text: str) -> bool:
        """Check if text represents a number"""
        try:
            text = str(text).replace(',', '').replace('$', '').strip()
            float(text)
            return True
        except (ValueError, AttributeError):
            return False
    
    def _parse_number(self, text: str) -> float:
        """Parse number from text"""
        text = str(text).replace(',', '').replace('$', '').strip()
        return float(text)
    
    def _check_numerical_consistency(self, numerical_data: Dict[str, List[Dict[str, Any]]], 
                                    document_data: Dict[str, Any]) -> List[Finding]:
        """Check for inconsistencies in numerical data"""
        
        findings = []
        
        # Check for duplicate numbers that might be inconsistent
        all_numbers = []
        for source in numerical_data.values():
            all_numbers.extend([item['value'] for item in source])
        
        # Look for numbers that appear multiple times with different contexts
        from collections import Counter
        number_counts = Counter(all_numbers)
        
        # Check specific financial metrics across sections
        revenue_values = []
        for item in numerical_data['text']:
            context = f"{item.get('context_before', '')} {item.get('context_after', '')}".lower()
            if 'revenue' in context:
                revenue_values.append(item['value'])
        
        if len(set(revenue_values)) > 1:
            findings.append(self.create_finding(
                severity='HIGH',
                category='financial',
                title='Inconsistent Revenue Figures',
                description=f'Multiple different revenue values found: {list(set(revenue_values))}',
                evidence=[f"Revenue: ${v:,.2f}" for v in revenue_values],
                confidence=0.85,
                recommendations=['Verify which revenue figure is correct', 'Check for different time periods']
            ))
        
        return findings
    
    def _check_contradictions(self, document_data: Dict[str, Any]) -> List[Finding]:
        """Check for contradictory statements using LLM"""
        
        findings = []
        text_content = self.extract_text_content(document_data)
        
        # Use LLM to find contradictions
        prompt = f"""Analyze the following document text for internal contradictions or inconsistencies.
Look for statements that conflict with each other.

Document Text:
{text_content[:4000]}  # Limit to first 4000 chars

Identify any contradictions and respond in JSON format:
{{
  "contradictions": [
    {{
      "statement1": "...",
      "statement2": "...",
      "severity": "HIGH|MEDIUM|LOW",
      "explanation": "..."
    }}
  ]
}}
"""
        
        try:
            response = self.invoke_llm(prompt)
            
            # Parse LLM response
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                data = json.loads(json_str)
                
                for contradiction in data.get('contradictions', []):
                    findings.append(self.create_finding(
                        severity=contradiction.get('severity', 'MEDIUM'),
                        category='consistency',
                        title='Contradictory Statements',
                        description=contradiction.get('explanation', ''),
                        evidence=[
                            contradiction.get('statement1', ''),
                            contradiction.get('statement2', '')
                        ],
                        confidence=0.75,
                        recommendations=['Clarify which statement is accurate']
                    ))
        
        except Exception as e:
            logger.error(f"Error checking contradictions: {e}")
        
        return findings
    
    def _validate_tables(self, document_data: Dict[str, Any]) -> List[Finding]:
        """Validate table calculations and totals"""
        
        findings = []
        
        for table_idx, table in enumerate(document_data.get('tables', [])):
            data = table.get('data', [])
            
            if len(data) < 2:
                continue
            
            # Check for sum rows (typically last row)
            last_row = data[-1]
            
            # Check if last row contains totals
            if any(term in str(last_row[0]).lower() 
                   for term in ['total', 'sum', 'subtotal']):
                
                # Validate each column
                for col_idx in range(1, len(last_row)):
                    try:
                        # Get column values
                        column_values = []
                        for row_idx in range(1, len(data) - 1):  # Skip header and total row
                            if row_idx < len(data) and col_idx < len(data[row_idx]):
                                cell_value = data[row_idx][col_idx]
                                if self._is_numeric(cell_value):
                                    column_values.append(self._parse_number(cell_value))
                        
                        # Check total
                        if column_values and self._is_numeric(last_row[col_idx]):
                            calculated_total = sum(column_values)
                            stated_total = self._parse_number(last_row[col_idx])
                            
                            # Allow for small rounding differences
                            if abs(calculated_total - stated_total) > 0.02:
                                findings.append(self.create_finding(
                                    severity='MEDIUM',
                                    category='calculation',
                                    title='Table Calculation Mismatch',
                                    description=f'Table {table_idx + 1}, Column {col_idx + 1}: Calculated total ({calculated_total:.2f}) does not match stated total ({stated_total:.2f})',
                                    evidence=[
                                        f"Calculated: {calculated_total:.2f}",
                                        f"Stated: {stated_total:.2f}",
                                        f"Difference: {abs(calculated_total - stated_total):.2f}"
                                    ],
                                    confidence=0.9,
                                    recommendations=['Verify calculation methodology', 'Check for missing or extra rows']
                                ))
                    
                    except Exception as e:
                        logger.debug(f"Error validating table column: {e}")
        
        return findings
    
    def _calculate_confidence(self, findings: List[Finding]) -> float:
        """Calculate overall confidence in consistency analysis"""
        
        if not findings:
            return 0.95
        
        # More critical findings = lower confidence
        critical_count = len([f for f in findings if f.severity == 'CRITICAL'])
        high_count = len([f for f in findings if f.severity == 'HIGH'])
        
        confidence = 0.95 - (critical_count * 0.15) - (high_count * 0.10)
        return max(0.0, min(1.0, confidence))
    
    def _generate_reasoning(self, findings: List[Finding]) -> str:
        """Generate human-readable reasoning"""
        
        if not findings:
            return "Document demonstrates strong internal consistency with no major discrepancies identified."
        
        critical = [f for f in findings if f.severity == 'CRITICAL']
        high = [f for f in findings if f.severity == 'HIGH']
        
        reasoning_parts = [
            f"Identified {len(findings)} consistency issue(s):",
            f"- {len(critical)} critical",
            f"- {len(high)} high priority"
        ]
        
        if critical:
            reasoning_parts.append(f"Critical issues require immediate attention: {critical[0].title}")
        
        return " ".join(reasoning_parts)
