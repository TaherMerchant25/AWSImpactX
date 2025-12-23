import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Fetch dashboard statistics
export async function GET() {
  try {
    // Get document counts
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, processing_status');

    if (docError) throw docError;

    // Get findings by severity
    const { data: findings, error: findError } = await supabase
      .from('findings')
      .select('id, severity, agent_type, created_at');

    if (findError) throw findError;

    // Get recent executions
    const { data: executions, error: execError } = await supabase
      .from('agent_executions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (execError) throw execError;

    // Calculate stats
    const totalDocuments = documents?.length || 0;
    const completedDocuments = documents?.filter(d => d.processing_status === 'completed').length || 0;
    const processingDocuments = documents?.filter(d => d.processing_status === 'processing').length || 0;

    const totalFindings = findings?.length || 0;
    const criticalFindings = findings?.filter(f => f.severity === 'critical').length || 0;
    const highFindings = findings?.filter(f => f.severity === 'high').length || 0;
    const mediumFindings = findings?.filter(f => f.severity === 'medium').length || 0;
    const lowFindings = findings?.filter(f => f.severity === 'low').length || 0;

    // Calculate average processing time
    const completedExecutions = executions?.filter(e => e.status === 'completed' && e.execution_time) || [];
    const avgProcessingTime = completedExecutions.length > 0
      ? completedExecutions.reduce((sum, e) => sum + (e.execution_time || 0), 0) / completedExecutions.length
      : 0;

    // Agent status summary
    const agentNames = ['Consistency Agent', 'Greenwashing Detector', 'Compliance Agent', 'Math Agent', 'Risk Analysis Agent'];
    const agentStats = agentNames.map(name => {
      const agentExecutions = executions?.filter(e => e.agent_name === name) || [];
      const lastExecution = agentExecutions[0];
      return {
        name,
        status: lastExecution?.status || 'idle',
        lastRun: lastExecution?.started_at || null,
        totalRuns: agentExecutions.length,
        avgConfidence: agentExecutions.length > 0
          ? agentExecutions.reduce((sum, e) => sum + (e.confidence_score || 0), 0) / agentExecutions.length
          : 0
      };
    });

    // Findings by agent
    const findingsByAgent = agentNames.reduce((acc, name) => {
      acc[name] = findings?.filter(f => f.agent_type === name).length || 0;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentFindings = findings?.filter(f => new Date(f.created_at) > weekAgo).length || 0;

    return NextResponse.json({
      documents: {
        total: totalDocuments,
        completed: completedDocuments,
        processing: processingDocuments,
        pending: totalDocuments - completedDocuments - processingDocuments
      },
      findings: {
        total: totalFindings,
        critical: criticalFindings,
        high: highFindings,
        medium: mediumFindings,
        low: lowFindings,
        recentWeek: recentFindings
      },
      agents: agentStats,
      performance: {
        avgProcessingTime: Math.round(avgProcessingTime * 100) / 100,
        totalExecutions: executions?.length || 0
      },
      findingsByAgent
    });

  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
