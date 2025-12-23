import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Document {
  id: string
  filename: string
  file_type: string
  file_size: number
  s3_key?: string
  upload_timestamp: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  metadata?: Record<string, any>
}

export interface Finding {
  id: string
  document_id: string
  agent_type: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  recommendation?: string
  confidence_score?: number
  created_at: string
  metadata?: Record<string, any>
}

export interface AgentExecution {
  id: string
  document_id: string
  agent_type: string
  status: 'running' | 'completed' | 'failed'
  start_time: string
  end_time?: string
  findings_count: number
  error_message?: string
  execution_time_ms?: number
}

export interface SystemLog {
  id: string
  level: 'info' | 'warning' | 'error'
  message: string
  component: string
  timestamp: string
  metadata?: Record<string, any>
}
