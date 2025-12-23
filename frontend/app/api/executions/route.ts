import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Fetch agent executions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('agent_executions')
      .select('*')
      .order('started_at', { ascending: false });

    if (documentId) {
      query = query.eq('document_id', documentId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ executions: data || [] });
  } catch (error: any) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}

// POST - Create execution record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('agent_executions')
      .insert({
        document_id: body.document_id,
        agent_name: body.agent_name,
        status: body.status || 'running',
        execution_time: body.execution_time || 0,
        findings_count: body.findings_count || 0,
        confidence_score: body.confidence_score || 0,
        metadata: body.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ execution: data });
  } catch (error: any) {
    console.error('Error creating execution:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create execution' },
      { status: 500 }
    );
  }
}
