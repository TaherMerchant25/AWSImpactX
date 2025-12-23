-- ASPERA Platform - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    s3_key VARCHAR(500),
    upload_timestamp TIMESTAMPTZ DEFAULT NOW(),
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Findings Table
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    confidence_score DECIMAL(3,2),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Executions Table
CREATE TABLE IF NOT EXISTS agent_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    findings_count INTEGER DEFAULT 0,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error')),
    message TEXT NOT NULL,
    component VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_findings_document ON findings(document_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);
CREATE INDEX IF NOT EXISTS idx_findings_agent ON findings(agent_type);
CREATE INDEX IF NOT EXISTS idx_executions_document ON agent_executions(document_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON system_logs(timestamp DESC);

-- Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply Trigger to Documents Table
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow all operations for now - customize as needed)
CREATE POLICY "Enable all operations for documents" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for findings" ON findings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for agent_executions" ON agent_executions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for system_logs" ON system_logs FOR ALL USING (true) WITH CHECK (true);

-- Create Views for Analytics
CREATE OR REPLACE VIEW document_stats AS
SELECT 
    processing_status,
    COUNT(*) as count,
    SUM(file_size) as total_size,
    AVG(file_size) as avg_size
FROM documents
GROUP BY processing_status;

CREATE OR REPLACE VIEW findings_by_severity AS
SELECT 
    severity,
    agent_type,
    COUNT(*) as count
FROM findings
GROUP BY severity, agent_type
ORDER BY severity, agent_type;

CREATE OR REPLACE VIEW agent_performance AS
SELECT 
    agent_type,
    COUNT(*) as total_executions,
    AVG(execution_time_ms) as avg_execution_time,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_executions,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_executions
FROM agent_executions
GROUP BY agent_type;

-- Insert Sample Data for Testing
INSERT INTO documents (filename, file_type, file_size, processing_status, metadata) VALUES
    ('sample-financial-report.pdf', 'pdf', 2048576, 'completed', '{"year": 2024, "quarter": "Q4"}'),
    ('sustainability-report.pdf', 'pdf', 1536000, 'processing', '{"year": 2024, "type": "ESG"}'),
    ('climate-disclosure.xlsx', 'xlsx', 512000, 'pending', '{"framework": "TCFD"}');

INSERT INTO findings (document_id, agent_type, severity, title, description, recommendation, confidence_score) VALUES
    ((SELECT id FROM documents WHERE filename = 'sample-financial-report.pdf'), 'consistency', 'high', 'Revenue Inconsistency', 'Q3 revenue figures do not match across statements', 'Review and reconcile revenue figures', 0.92),
    ((SELECT id FROM documents WHERE filename = 'sample-financial-report.pdf'), 'greenwashing', 'medium', 'Vague Climate Commitment', 'Net-zero target lacks specific timeline and milestones', 'Define clear interim targets and implementation plan', 0.85),
    ((SELECT id FROM documents WHERE filename = 'sustainability-report.pdf'), 'compliance', 'critical', 'Missing GHG Disclosure', 'Scope 3 emissions not disclosed as required by EU CSRD', 'Include comprehensive Scope 3 emissions data', 0.95);

INSERT INTO agent_executions (document_id, agent_type, status, start_time, end_time, findings_count, execution_time_ms) VALUES
    ((SELECT id FROM documents WHERE filename = 'sample-financial-report.pdf'), 'consistency', 'completed', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '58 minutes', 3, 120000),
    ((SELECT id FROM documents WHERE filename = 'sample-financial-report.pdf'), 'greenwashing', 'completed', NOW() - INTERVAL '58 minutes', NOW() - INTERVAL '55 minutes', 2, 180000),
    ((SELECT id FROM documents WHERE filename = 'sustainability-report.pdf'), 'compliance', 'running', NOW() - INTERVAL '10 minutes', NULL, 0, NULL);

INSERT INTO system_logs (level, message, component, metadata) VALUES
    ('info', 'System startup completed', 'system', '{"version": "1.0.0"}'),
    ('warning', 'High memory usage detected', 'monitoring', '{"memory_percent": 85}'),
    ('error', 'Failed to connect to S3 bucket', 's3_service', '{"bucket": "aspera-documents", "error": "AccessDenied"}');

-- Grant permissions (adjust based on your RLS policies)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
