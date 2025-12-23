"""
Base Agent Class
Foundation for all specialized agents in the system
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from dataclasses import dataclass
from aws_lambda_powertools import Logger, Tracer
import boto3
import json

logger = Logger()
tracer = Tracer()


@dataclass
class Finding:
    """Represents a finding from an agent"""
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    category: str
    title: str
    description: str
    evidence: List[str]
    confidence: float
    recommendations: List[str]


class BaseAgent(ABC):
    """Base class for all agents"""
    
    def __init__(self, agent_name: str, mcp_hub):
        self.agent_name = agent_name
        self.mcp_hub = mcp_hub
        self.bedrock_client = boto3.client('bedrock-runtime')
        self.model_id = 'anthropic.claude-3-5-sonnet-20241022-v2:0'
    
    @abstractmethod
    def analyze(self, document_data: Dict[str, Any], 
               context: Dict[str, Any],
               previous_results: Dict[str, Any] = None) -> Any:
        """Main analysis method - must be implemented by subclasses"""
        pass
    
    @tracer.capture_method
    def invoke_llm(self, prompt: str, temperature: float = 0.1) -> str:
        """Invoke Bedrock LLM with prompt"""
        
        try:
            response = self.bedrock_client.invoke_model(
                modelId=self.model_id,
                body=json.dumps({
                    'anthropic_version': 'bedrock-2023-05-31',
                    'max_tokens': 4096,
                    'temperature': temperature,
                    'messages': [
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ]
                })
            )
            
            response_body = json.loads(response['body'].read())
            return response_body['content'][0]['text']
            
        except Exception as e:
            logger.exception(f"Error invoking LLM for {self.agent_name}")
            raise
    
    def extract_text_content(self, document_data: Dict[str, Any]) -> str:
        """Extract full text from document data"""
        
        text_content = document_data.get('text_content', [])
        return " ".join([t.get('text', '') for t in text_content])
    
    def create_finding(self, severity: str, category: str, title: str,
                      description: str, evidence: List[str],
                      confidence: float, recommendations: List[str]) -> Finding:
        """Create a standardized finding"""
        
        return Finding(
            severity=severity,
            category=category,
            title=title,
            description=description,
            evidence=evidence,
            confidence=confidence,
            recommendations=recommendations
        )
