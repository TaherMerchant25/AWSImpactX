import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Fetch all documents
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('upload_timestamp', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ documents: data || [] });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST - Create a new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('documents')
      .insert({
        filename: body.filename,
        file_type: body.file_type,
        file_size: body.file_size,
        s3_key: body.s3_key || null,
        processing_status: 'pending',
        metadata: body.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ document: data });
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create document' },
      { status: 500 }
    );
  }
}
