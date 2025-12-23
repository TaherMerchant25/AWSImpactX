"""
Greenwashing Detector Agent
Identifies unsubstantiated environmental, social, and governance (ESG) claims
"""
import json
import re
from typing import Dict, Any, List, Set
from aws_lambda_powertools import Logger, Tracer
from dataclasses import asdict
from .base_agent import BaseAgent, Finding

logger = Logger()
tracer = Tracer()


class GreenwashingDetectorAgent(BaseAgent):
    """
    Agent that detects greenwashing - misleading environmental claims
    """
    
    # Greenwashing trigger keywords
    TRIGGER_KEYWORDS = {
        'carbon neutral', 'net zero', 'carbon negative',
        'sustainable', 'eco-friendly', 'green', 'environmentally friendly',
        'climate positive', 'carbon offset', 'renewable',
        '100% recyclable', 'biodegradable', 'natural',
        'clean energy', 'zero emissions', 'carbon free'
    }
    
    # Evidence keywords that should accompany claims
    EVIDENCE_KEYWORDS = {
        'certified', 'verified', 'audited', 'measured',
        'data', 'report', 'standard', 'ISO',
        'third-party', 'independent', 'accredited'
    }
    
    def __init__(self, mcp_hub):
        super().__init__("Greenwashing Detector", mcp_hub)
    
    @tracer.capture_method
    def analyze(self, document_data: Dict[str, Any], 
               context: Dict[str, Any],
               previous_results: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Detect greenwashing in document
        """
        logger.info("Starting greenwashing detection")
        
        findings = []
        
        # Extract environmental claims
        claims = self._extract_environmental_claims(document_data)
        
        # Validate each claim
        for claim in claims:
            validation = self._validate_claim(claim, document_data)
            if not validation['substantiated']:
                findings.append(self.create_finding(
                    severity=validation['severity'],
                    category='esg',
                    title=f"Unsubstantiated {claim['type']} Claim",
                    description=f"Environmental claim lacks sufficient evidence: {claim['text'][:200]}",
                    evidence=[claim['text']] + validation['missing_evidence'],
                    confidence=validation['confidence'],
                    recommendations=validation['recommendations']
                ))
        
        # Use LLM for sophisticated analysis
        findings.extend(self._llm_greenwashing_analysis(document_data))
        
        # Calculate metrics
        confidence = self._calculate_confidence(findings, claims)
        reasoning = self._generate_reasoning(findings, claims)
        
        return {
            'agent_type': 'greenwashing',
            'success': True,
            'findings': [asdict(f) for f in findings],
            'confidence': confidence,
            'reasoning': reasoning,
            'metadata': {
                'total_claims': len(claims),
                'unsubstantiated_claims': len(findings),
                'greenwashing_risk': self._calculate_risk_level(findings, claims)
            }
        }
    
    def _extract_environmental_claims(self, document_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract environmental and ESG claims from document"""
        
        claims = []
        text_content = self.extract_text_content(document_data)
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', text_content)
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            
            # Check if sentence contains trigger keywords
            for keyword in self.TRIGGER_KEYWORDS:
                if keyword in sentence_lower:
                    claims.append({
                        'text': sentence.strip(),
                        'type': self._classify_claim_type(keyword),
                        'keyword': keyword,
                        'context_window': sentence_lower
                    })
                    break  # Only count each sentence once
        
        return claims
    
    def _classify_claim_type(self, keyword: str) -> str:
        """Classify the type of environmental claim"""
        
        carbon_terms = {'carbon neutral', 'net zero', 'carbon negative', 'carbon offset', 'carbon free', 'zero emissions'}
        sustainability_terms = {'sustainable', 'eco-friendly', 'environmentally friendly', 'green'}
        energy_terms = {'renewable', 'clean energy'}
        material_terms = {'recyclable', 'biodegradable', 'natural'}
        
        if keyword in carbon_terms:
            return 'Carbon/Emissions'
        elif keyword in sustainability_terms:
            return 'Sustainability'
        elif keyword in energy_terms:
            return 'Energy'
        elif keyword in material_terms:
            return 'Materials'
        else:
            return 'General Environmental'
    
    def _validate_claim(self, claim: Dict[str, Any], 
                       document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate if a claim has sufficient evidence"""
        
        text_content = self.extract_text_content(document_data)
        claim_text = claim['text']
        claim_type = claim['type']
        
        # Check for evidence keywords nearby
        # Search within 500 characters around the claim
        start_pos = text_content.find(claim_text)
        if start_pos == -1:
            context = claim_text
        else:
            context_start = max(0, start_pos - 500)
            context_end = min(len(text_content), start_pos + len(claim_text) + 500)
            context = text_content[context_start:context_end].lower()
        
        # Count evidence keywords
        evidence_found = [kw for kw in self.EVIDENCE_KEYWORDS if kw in context]
        
        # Check for specific evidence types
        has_certification = any(term in context for term in ['certified', 'certification', 'iso'])
        has_data = any(term in context for term in ['data', 'measured', 'report', 'metric'])
        has_verification = any(term in context for term in ['verified', 'audited', 'third-party'])
        
        # Scoring
        evidence_score = len(evidence_found)
        
        substantiated = evidence_score >= 2 or (has_certification and has_data)
        
        if substantiated:
            return {
                'substantiated': True,
                'confidence': 0.8,
                'severity': 'LOW',
                'recommendations': [],
                'missing_evidence': []
            }
        else:
            missing = []
            if not has_certification:
                missing.append("No certification or standard mentioned")
            if not has_data:
                missing.append("No quantitative data or measurements provided")
            if not has_verification:
                missing.append("No third-party verification mentioned")
            
            severity = 'HIGH' if evidence_score == 0 else 'MEDIUM'
            
            return {
                'substantiated': False,
                'confidence': 0.85,
                'severity': severity,
                'recommendations': [
                    'Provide certification from recognized standards body',
                    'Include quantitative metrics and measurement methodology',
                    'Obtain third-party verification',
                    'Reference specific actions and timeline'
                ],
                'missing_evidence': missing
            }
    
    def _llm_greenwashing_analysis(self, document_data: Dict[str, Any]) -> List[Finding]:
        """Use LLM for sophisticated greenwashing detection"""
        
        findings = []
        text_content = self.extract_text_content(document_data)
        
        # Focus on ESG sections
        esg_keywords = ['environmental', 'social', 'governance', 'sustainability', 'esg', 'impact']
        
        # Extract relevant sections
        sections = []
        sentences = re.split(r'[.!?]+', text_content)
        
        for i, sentence in enumerate(sentences):
            if any(kw in sentence.lower() for kw in esg_keywords):
                # Get context (current + next 2 sentences)
                context_sentences = sentences[i:min(i+3, len(sentences))]
                sections.append(' '.join(context_sentences))
        
        if not sections:
            return findings
        
        # Analyze with LLM
        prompt = f"""You are an expert in ESG compliance and greenwashing detection. Analyze the following sections from an investment document for potential greenwashing.

Greenwashing indicators:
- Vague claims without specific metrics
- Claims without third-party verification
- Selective disclosure
- Hidden trade-offs
- Irrelevant claims
- Lesser of two evils
- Fibbing (false claims)

Sections:
{' | '.join(sections[:3])}  # Analyze first 3 sections

Respond in JSON format:
{{
  "potential_greenwashing": [
    {{
      "claim": "...",
      "issue": "...",
      "severity": "HIGH|MEDIUM|LOW",
      "recommendation": "..."
    }}
  ]
}}
"""
        
        try:
            response = self.invoke_llm(prompt)
            
            # Parse response
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                data = json.loads(json_str)
                
                for item in data.get('potential_greenwashing', []):
                    findings.append(self.create_finding(
                        severity=item.get('severity', 'MEDIUM'),
                        category='esg',
                        title='Potential Greenwashing Detected',
                        description=item.get('issue', ''),
                        evidence=[item.get('claim', '')],
                        confidence=0.75,
                        recommendations=[item.get('recommendation', 'Provide substantiation')]
                    ))
        
        except Exception as e:
            logger.error(f"Error in LLM greenwashing analysis: {e}")
        
        return findings
    
    def _calculate_confidence(self, findings: List[Finding], claims: List[Dict[str, Any]]) -> float:
        """Calculate confidence in analysis"""
        
        if not claims:
            return 0.95  # High confidence when no claims found
        
        # Confidence decreases with more unsubstantiated claims
        ratio = len(findings) / len(claims) if claims else 0
        
        confidence = 0.9 - (ratio * 0.2)
        return max(0.6, min(0.95, confidence))
    
    def _calculate_risk_level(self, findings: List[Finding], claims: List[Dict[str, Any]]) -> str:
        """Calculate overall greenwashing risk level"""
        
        if not claims:
            return 'LOW'
        
        high_severity = len([f for f in findings if f.severity in ['CRITICAL', 'HIGH']])
        ratio = len(findings) / len(claims) if claims else 0
        
        if high_severity >= 3 or ratio > 0.5:
            return 'HIGH'
        elif high_severity >= 1 or ratio > 0.3:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _generate_reasoning(self, findings: List[Finding], claims: List[Dict[str, Any]]) -> str:
        """Generate reasoning summary"""
        
        if not claims:
            return "No environmental or ESG claims found in document."
        
        if not findings:
            return f"Analyzed {len(claims)} environmental claim(s). All claims appear to be adequately substantiated."
        
        ratio = (len(findings) / len(claims)) * 100
        
        return (f"Found {len(claims)} environmental claim(s), of which {len(findings)} "
                f"({ratio:.1f}%) lack sufficient substantiation. "
                f"Risk level: {self._calculate_risk_level(findings, claims)}")
