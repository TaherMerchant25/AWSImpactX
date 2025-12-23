import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Fetch all findings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('findings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (documentId) {
      query = query.eq('document_id', documentId);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ findings: data || [] });
  } catch (error: any) {
    console.error('Error fetching findings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch findings' },
      { status: 500 }
    );
  }
}

// POST - Create a new finding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('findings')
      .insert({
        document_id: body.document_id,
        agent_type: body.agent_type,
        severity: body.severity,
        category: body.category,
        title: body.title,
        description: body.description,
        evidence: body.evidence || [],
        recommendations: body.recommendations || [],
        confidence_score: body.confidence_score || 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ finding: data });
  } catch (error: any) {
    console.error('Error creating finding:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create finding' },
      { status: 500 }
    );
  }
}
