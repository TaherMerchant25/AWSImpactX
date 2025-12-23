"""
Risk Analysis Agent
Performs comprehensive risk assessment across multiple dimensions
"""
import json
from typing import Dict, Any, List, Optional
from aws_lambda_powertools import Logger, Tracer
from dataclasses import asdict
from .base_agent import BaseAgent, Finding

logger = Logger()
tracer = Tracer()


class RiskAnalysisAgent(BaseAgent):
    """
    Agent that performs comprehensive risk analysis
    """
    
    RISK_CATEGORIES = [
        'financial', 'operational', 'market', 'compliance',
        'reputational', 'strategic', 'technology', 'esg'
    ]
    
    def __init__(self, mcp_hub):
        super().__init__("Risk Analysis Agent", mcp_hub)
    
    @tracer.capture_method
    def analyze(self, document_data: Dict[str, Any], 
               context: Dict[str, Any],
               previous_results: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Perform comprehensive risk analysis
        """
        logger.info("Starting risk analysis")
        
        findings = []
        
        # Aggregate risks from previous agents
        if previous_results:
            findings.extend(self._aggregate_agent_risks(previous_results))
        
        # Identify additional risks
        findings.extend(self._identify_document_risks(document_data))
        
        # Assess risk interdependencies
        risk_network = self._analyze_risk_interdependencies(findings)
        
        # Use LLM for sophisticated risk assessment
        findings.extend(self._llm_risk_assessment(document_data, previous_results))
        
        # Calculate risk scores by category
        risk_scores = self._calculate_risk_scores(findings)
        
        # Determine overall risk level
        overall_risk = self._determine_overall_risk(risk_scores)
        
        confidence = 0.85
        reasoning = self._generate_reasoning(findings, risk_scores, overall_risk)
        
        return {
            'agent_type': 'risk_analysis',
            'success': True,
            'findings': [asdict(f) for f in findings],
            'confidence': confidence,
            'reasoning': reasoning,
            'metadata': {
                'risk_scores': risk_scores,
                'overall_risk_level': overall_risk,
                'risk_network': risk_network,
                'total_risks': len(findings)
            }
        }
    
    def _aggregate_agent_risks(self, previous_results: Dict[str, Any]) -> List[Finding]:
        """Aggregate risks identified by other agents"""
        
        aggregated_findings = []
        
        for agent_type, result in previous_results.items():
            if not isinstance(result, dict):
                continue
                
            agent_findings = result.get('findings', [])
            
            for finding_dict in agent_findings:
                if isinstance(finding_dict, dict):
                    # Convert back to Finding object
                    finding = Finding(
                        severity=finding_dict.get('severity', 'MEDIUM'),
                        category=finding_dict.get('category', 'general'),
                        title=finding_dict.get('title', ''),
                        description=finding_dict.get('description', ''),
                        evidence=finding_dict.get('evidence', []),
                        confidence=finding_dict.get('confidence', 0.7),
                        recommendations=finding_dict.get('recommendations', [])
                    )
                    aggregated_findings.append(finding)
        
        return aggregated_findings
    
    def _identify_document_risks(self, document_data: Dict[str, Any]) -> List[Finding]:
        """Identify additional risks from document content"""
        
        findings = []
        text_content = self.extract_text_content(document_data).lower()
        
        # Risk keywords by category
        risk_indicators = {
            'market': ['market volatility', 'competition', 'market share', 'pricing pressure'],
            'operational': ['supply chain', 'operational efficiency', 'capacity', 'disruption'],
            'technology': ['cybersecurity', 'data breach', 'system failure', 'technology risk'],
            'strategic': ['strategy', 'business model', 'competitive advantage', 'market position'],
            'reputational': ['reputation', 'brand', 'public perception', 'media'],
        }
        
        for category, keywords in risk_indicators.items():
            mentions = sum(1 for kw in keywords if kw in text_content)
            
            if mentions >= 3:
                findings.append(self.create_finding(
                    severity='MEDIUM',
                    category=category,
                    title=f'{category.title()} Risks Identified',
                    description=f'Document discusses multiple {category} risk factors',
                    evidence=[f'{mentions} related mentions found'],
                    confidence=0.70,
                    recommendations=[f'Deep dive into {category} risk mitigation strategies']
                ))
        
        return findings
    
    def _analyze_risk_interdependencies(self, findings: List[Finding]) -> Dict[str, Any]:
        """Analyze how risks are interconnected"""
        
        # Group findings by category
        category_counts = {}
        for finding in findings:
            category = finding.category
            if category not in category_counts:
                category_counts[category] = 0
            category_counts[category] += 1
        
        # Identify cascading risks
        cascading_risks = []
        
        # Financial + Operational risks can cascade
        if 'financial' in category_counts and 'operational' in category_counts:
            cascading_risks.append({
                'primary': 'financial',
                'secondary': 'operational',
                'impact': 'high'
            })
        
        # Compliance + Reputational risks can cascade
        if 'compliance' in category_counts and 'reputational' in category_counts:
            cascading_risks.append({
                'primary': 'compliance',
                'secondary': 'reputational',
                'impact': 'high'
            })
        
        return {
            'category_distribution': category_counts,
            'cascading_risks': cascading_risks,
            'concentration': max(category_counts.values()) if category_counts else 0
        }
    
    def _llm_risk_assessment(self, document_data: Dict[str, Any], 
                            previous_results: Optional[Dict[str, Any]]) -> List[Finding]:
        """Use LLM for sophisticated risk assessment"""
        
        findings = []
        text_content = self.extract_text_content(document_data)
        
        # Build context from previous agent results
        context_summary = ""
        if previous_results:
            context_summary = "\n\nPrevious Analysis Summary:\n"
            for agent_type, result in previous_results.items():
                if isinstance(result, dict):
                    context_summary += f"- {agent_type}: {result.get('reasoning', 'N/A')}\n"
        
        prompt = f"""You are an expert risk analyst reviewing an investment opportunity. Perform a comprehensive risk assessment.

Document excerpt:
{text_content[:3000]}
{context_summary}

Identify and categorize risks across these dimensions:
- Financial Risk
- Operational Risk
- Market Risk
- Strategic Risk
- ESG Risk
- Technology Risk

For each significant risk, assess:
1. Likelihood (HIGH/MEDIUM/LOW)
2. Impact (HIGH/MEDIUM/LOW)
3. Mitigation strategies

Respond in JSON format:
{{
  "risks": [
    {{
      "category": "...",
      "title": "...",
      "description": "...",
      "likelihood": "HIGH|MEDIUM|LOW",
      "impact": "HIGH|MEDIUM|LOW",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "mitigation": "..."
    }}
  ]
}}
"""
        
        try:
            response = self.invoke_llm(prompt)
            
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                data = json.loads(json_str)
                
                for risk in data.get('risks', []):
                    findings.append(self.create_finding(
                        severity=risk.get('severity', 'MEDIUM'),
                        category=risk.get('category', 'general').lower(),
                        title=risk.get('title', ''),
                        description=risk.get('description', ''),
                        evidence=[
                            f"Likelihood: {risk.get('likelihood', 'UNKNOWN')}",
                            f"Impact: {risk.get('impact', 'UNKNOWN')}"
                        ],
                        confidence=0.75,
                        recommendations=[risk.get('mitigation', 'Develop mitigation strategy')]
                    ))
        
        except Exception as e:
            logger.error(f"Error in LLM risk assessment: {e}")
        
        return findings
    
    def _calculate_risk_scores(self, findings: List[Finding]) -> Dict[str, float]:
        """Calculate risk scores by category (0-100)"""
        
        scores = {}
        
        for category in self.RISK_CATEGORIES:
            category_findings = [f for f in findings if f.category == category]
            
            if not category_findings:
                scores[category] = 10.0  # Baseline low risk
                continue
            
            # Calculate score based on severity
            score = 10.0
            for finding in category_findings:
                if finding.severity == 'CRITICAL':
                    score += 30
                elif finding.severity == 'HIGH':
                    score += 20
                elif finding.severity == 'MEDIUM':
                    score += 10
                else:
                    score += 5
            
            scores[category] = min(100.0, score)
        
        return scores
    
    def _determine_overall_risk(self, risk_scores: Dict[str, float]) -> str:
        """Determine overall risk level"""
        
        if not risk_scores:
            return 'LOW'
        
        max_score = max(risk_scores.values())
        avg_score = sum(risk_scores.values()) / len(risk_scores)
        
        # Check for any critical category
        if max_score >= 80:
            return 'CRITICAL'
        elif max_score >= 60 or avg_score >= 50:
            return 'HIGH'
        elif max_score >= 40 or avg_score >= 30:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _generate_reasoning(self, findings: List[Finding], 
                           risk_scores: Dict[str, float],
                           overall_risk: str) -> str:
        """Generate reasoning summary"""
        
        critical = len([f for f in findings if f.severity == 'CRITICAL'])
        high = len([f for f in findings if f.severity == 'HIGH'])
        
        # Find highest risk categories
        top_categories = sorted(risk_scores.items(), key=lambda x: x[1], reverse=True)[:3]
        top_risks = ", ".join([f"{cat} ({score:.0f})" for cat, score in top_categories])
        
        return (f"Comprehensive risk analysis identified {len(findings)} total risk factor(s): "
                f"{critical} critical, {high} high priority. "
                f"Overall risk level: {overall_risk}. "
                f"Top risk categories: {top_risks}")
