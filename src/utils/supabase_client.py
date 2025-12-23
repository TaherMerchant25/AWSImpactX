"""
Supabase Database Client for ASPERA Platform
Provides backup storage and querying capabilities
"""

import os
from typing import Optional, List, Dict, Any
from datetime import datetime
from supabase import create_client, Client

class SupabaseDB:
    """Supabase database client for ASPERA platform"""
    
    def __init__(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    # Document Operations
    async def create_document(
        self,
        filename: str,
        file_type: str,
        file_size: int,
        s3_key: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new document record"""
        data = {
            'filename': filename,
            'file_type': file_type,
            'file_size': file_size,
            's3_key': s3_key,
            'processing_status': 'pending',
            'metadata': metadata or {}
        }
        
        result = self.client.table('documents').insert(data).execute()
        return result.data[0] if result.data else {}
    
    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        result = self.client.table('documents').select('*').eq('id', document_id).execute()
        return result.data[0] if result.data else None
    
    async def update_document_status(
        self,
        document_id: str,
        status: str
    ) -> Dict[str, Any]:
        """Update document processing status"""
        result = self.client.table('documents').update({
            'processing_status': status
        }).eq('id', document_id).execute()
        return result.data[0] if result.data else {}
    
    async def list_documents(
        self,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """List documents with optional status filter"""
        query = self.client.table('documents').select('*')
        
        if status:
            query = query.eq('processing_status', status)
        
        result = query.order('created_at', desc=True).limit(limit).execute()
        return result.data or []
    
    # Finding Operations
    async def create_finding(
        self,
        document_id: str,
        agent_type: str,
        severity: str,
        title: str,
        description: str,
        recommendation: Optional[str] = None,
        confidence_score: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new finding"""
        data = {
            'document_id': document_id,
            'agent_type': agent_type,
            'severity': severity,
            'title': title,
            'description': description,
            'recommendation': recommendation,
            'confidence_score': confidence_score,
            'metadata': metadata or {}
        }
        
        result = self.client.table('findings').insert(data).execute()
        return result.data[0] if result.data else {}
    
    async def get_findings_by_document(
        self,
        document_id: str
    ) -> List[Dict[str, Any]]:
        """Get all findings for a document"""
        result = self.client.table('findings').select('*').eq(
            'document_id', document_id
        ).order('severity').execute()
        return result.data or []
    
    async def get_findings_by_severity(
        self,
        severity: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get findings by severity level"""
        result = self.client.table('findings').select('*').eq(
            'severity', severity
        ).order('created_at', desc=True).limit(limit).execute()
        return result.data or []
    
    # Agent Execution Operations
    async def create_agent_execution(
        self,
        document_id: str,
        agent_type: str
    ) -> Dict[str, Any]:
        """Create a new agent execution record"""
        data = {
            'document_id': document_id,
            'agent_type': agent_type,
            'status': 'running',
            'start_time': datetime.utcnow().isoformat(),
            'findings_count': 0
        }
        
        result = self.client.table('agent_executions').insert(data).execute()
        return result.data[0] if result.data else {}
    
    async def complete_agent_execution(
        self,
        execution_id: str,
        findings_count: int,
        execution_time_ms: int,
        error_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Mark agent execution as completed"""
        data = {
            'status': 'failed' if error_message else 'completed',
            'end_time': datetime.utcnow().isoformat(),
            'findings_count': findings_count,
            'execution_time_ms': execution_time_ms,
            'error_message': error_message
        }
        
        result = self.client.table('agent_executions').update(data).eq(
            'id', execution_id
        ).execute()
        return result.data[0] if result.data else {}
    
    async def get_agent_executions(
        self,
        document_id: Optional[str] = None,
        agent_type: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get agent executions with optional filters"""
        query = self.client.table('agent_executions').select('*')
        
        if document_id:
            query = query.eq('document_id', document_id)
        if agent_type:
            query = query.eq('agent_type', agent_type)
        
        result = query.order('start_time', desc=True).limit(limit).execute()
        return result.data or []
    
    # System Log Operations
    async def log(
        self,
        level: str,
        message: str,
        component: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a system log entry"""
        data = {
            'level': level,
            'message': message,
            'component': component,
            'metadata': metadata or {}
        }
        
        result = self.client.table('system_logs').insert(data).execute()
        return result.data[0] if result.data else {}
    
    async def get_logs(
        self,
        level: Optional[str] = None,
        component: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get system logs with optional filters"""
        query = self.client.table('system_logs').select('*')
        
        if level:
            query = query.eq('level', level)
        if component:
            query = query.eq('component', component)
        
        result = query.order('timestamp', desc=True).limit(limit).execute()
        return result.data or []
    
    # Analytics Operations
    async def get_document_stats(self) -> List[Dict[str, Any]]:
        """Get document statistics"""
        result = self.client.table('document_stats').select('*').execute()
        return result.data or []
    
    async def get_findings_by_severity_stats(self) -> List[Dict[str, Any]]:
        """Get findings grouped by severity and agent"""
        result = self.client.table('findings_by_severity').select('*').execute()
        return result.data or []
    
    async def get_agent_performance(self) -> List[Dict[str, Any]]:
        """Get agent performance metrics"""
        result = self.client.table('agent_performance').select('*').execute()
        return result.data or []
    
    # Health Check
    async def health_check(self) -> bool:
        """Check if database connection is healthy"""
        try:
            result = self.client.table('documents').select('id').limit(1).execute()
            return True
        except Exception:
            return False


# Singleton instance
_db_instance: Optional[SupabaseDB] = None

def get_db() -> SupabaseDB:
    """Get or create Supabase database instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = SupabaseDB()
    return _db_instance
