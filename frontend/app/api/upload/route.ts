import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'AWSIMPACTX';

// POST - Upload file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `documents/${timestamp}_${sanitizedName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // Create document record in database
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        s3_key: filePath,
        processing_status: 'pending',
        metadata: {
          bucket: BUCKET_NAME,
          original_name: file.name,
          upload_timestamp: new Date().toISOString(),
          public_url: urlData.publicUrl
        }
      })
      .select()
      .single();

    if (docError) {
      console.error('Document record error:', docError);
      // Still return success for upload, but note the DB error
      return NextResponse.json({
        success: true,
        file: {
          path: filePath,
          url: urlData.publicUrl,
          name: file.name,
          size: file.size,
          type: file.type
        },
        document_id: null,
        warning: 'File uploaded but document record failed'
      });
    }

    return NextResponse.json({
      success: true,
      file: {
        path: filePath,
        url: urlData.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      },
      document_id: docData.id,
      document: docData
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

// GET - List files in bucket
export async function GET() {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('documents', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      files: data,
      bucket: BUCKET_NAME
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to list files' },
      { status: 500 }
    );
  }
}
