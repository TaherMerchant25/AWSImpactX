import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ServiceStatus {
  status: string;
  message?: string;
  model?: string;
}

interface HealthCheck {
  status: string;
  timestamp: string;
  services: {
    supabase: ServiceStatus;
    gemini: ServiceStatus;
  };
}

// Health check endpoint
export async function GET() {
  const checks: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      supabase: { status: 'unknown' },
      gemini: { status: 'unknown' }
    }
  };

  // Check Supabase connection
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { error } = await supabase.from('documents').select('count').limit(1);
    checks.services.supabase = {
      status: error ? 'error' : 'healthy',
      message: error?.message
    };
  } catch (err: any) {
    checks.services.supabase = {
      status: 'error',
      message: err.message
    };
  }

  // Check Gemini API
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      checks.services.gemini = {
        status: 'not_configured',
        message: 'GEMINI_API_KEY not set'
      };
    } else {
      // Quick test call
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say "OK"' }] }],
            generationConfig: { maxOutputTokens: 10 }
          })
        }
      );
      
      if (response.ok) {
        checks.services.gemini = {
          status: 'healthy',
          model: 'gemini-2.0-flash-exp'
        };
      } else {
        const err = await response.json();
        checks.services.gemini = {
          status: 'error',
          message: err.error?.message || 'API request failed'
        };
      }
    }
  } catch (err: any) {
    checks.services.gemini = {
      status: 'error',
      message: err.message
    };
  }

  // Determine overall status
  const allHealthy = Object.values(checks.services).every(
    (s: ServiceStatus) => s.status === 'healthy'
  );
  checks.status = allHealthy ? 'healthy' : 'degraded';

  return NextResponse.json(checks);
}
