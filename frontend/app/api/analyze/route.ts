import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface AgentResult {
  agent: string;
  findings: any[];
  confidence: number;
  reasoning: string;
}

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function runConsistencyAgent(text: string): Promise<AgentResult> {
  const prompt = `You are a Consistency Agent analyzing financial documents for data inconsistencies.

Analyze the following text for any inconsistencies, contradictions, or conflicting statements:

${text}

Return your analysis as JSON with this structure:
{
  "findings": [
    {
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "category": "category name",
      "title": "brief title",
      "description": "detailed description",
      "evidence": ["specific quotes from text"],
      "recommendations": ["action items"]
    }
  ],
  "confidence": 0.0-1.0,
  "reasoning": "explanation of analysis"
}

Only return valid JSON, no other text.`;

  const response = await callGemini(prompt);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        agent: 'Consistency Agent',
        findings: parsed.findings || [],
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'Analysis complete'
      };
    }
  } catch (e) {
    console.error('Error parsing consistency response:', e);
  }
  
  return {
    agent: 'Consistency Agent',
    findings: [],
    confidence: 0.5,
    reasoning: 'Unable to parse response'
  };
}

async function runGreenwashingAgent(text: string): Promise<AgentResult> {
  const prompt = `You are a Greenwashing Detector Agent analyzing documents for unsubstantiated environmental claims.

Analyze the following text for greenwashing indicators:
- Vague environmental claims without data
- Unverified certifications
- Misleading sustainability statements
- Cherry-picked or irrelevant environmental data

Text to analyze:
${text}

Return your analysis as JSON with this structure:
{
  "findings": [
    {
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "category": "Greenwashing",
      "title": "brief title",
      "description": "detailed description",
      "evidence": ["specific quotes"],
      "recommendations": ["verification steps needed"]
    }
  ],
  "confidence": 0.0-1.0,
  "reasoning": "explanation of analysis"
}

Only return valid JSON, no other text.`;

  const response = await callGemini(prompt);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        agent: 'Greenwashing Detector',
        findings: parsed.findings || [],
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'Analysis complete'
      };
    }
  } catch (e) {
    console.error('Error parsing greenwashing response:', e);
  }
  
  return {
    agent: 'Greenwashing Detector',
    findings: [],
    confidence: 0.5,
    reasoning: 'Unable to parse response'
  };
}

async function runComplianceAgent(text: string): Promise<AgentResult> {
  const prompt = `You are a Compliance Agent checking documents for regulatory compliance issues.

Analyze the following text for compliance concerns:
- Missing required disclosures
- Regulatory violations
- Incomplete compliance statements
- Risk disclosure gaps

Text to analyze:
${text}

Return your analysis as JSON with this structure:
{
  "findings": [
    {
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "category": "Compliance",
      "title": "brief title",
      "description": "detailed description",
      "evidence": ["specific quotes"],
      "recommendations": ["compliance actions needed"]
    }
  ],
  "confidence": 0.0-1.0,
  "reasoning": "explanation of analysis"
}

Only return valid JSON, no other text.`;

  const response = await callGemini(prompt);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        agent: 'Compliance Agent',
        findings: parsed.findings || [],
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'Analysis complete'
      };
    }
  } catch (e) {
    console.error('Error parsing compliance response:', e);
  }
  
  return {
    agent: 'Compliance Agent',
    findings: [],
    confidence: 0.5,
    reasoning: 'Unable to parse response'
  };
}

async function runMathAgent(text: string): Promise<AgentResult> {
  const prompt = `You are a Math Agent validating financial calculations and numerical data.

Analyze the following text for mathematical and financial issues:
- Calculation errors
- Inconsistent percentages
- Mismatched totals
- Incorrect growth rates

Text to analyze:
${text}

Return your analysis as JSON with this structure:
{
  "findings": [
    {
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "category": "Mathematical",
      "title": "brief title",
      "description": "detailed description with correct calculations",
      "evidence": ["specific numbers from text"],
      "recommendations": ["corrections needed"]
    }
  ],
  "confidence": 0.0-1.0,
  "reasoning": "explanation of calculations checked"
}

Only return valid JSON, no other text.`;

  const response = await callGemini(prompt);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        agent: 'Math Agent',
        findings: parsed.findings || [],
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'Analysis complete'
      };
    }
  } catch (e) {
    console.error('Error parsing math response:', e);
  }
  
  return {
    agent: 'Math Agent',
    findings: [],
    confidence: 0.5,
    reasoning: 'Unable to parse response'
  };
}

async function runRiskAgent(text: string, previousFindings: any[]): Promise<AgentResult> {
  const prompt = `You are a Risk Analysis Agent performing comprehensive risk assessment.

Previous agent findings:
${JSON.stringify(previousFindings, null, 2)}

Original text:
${text}

Synthesize all findings and provide overall risk assessment with this structure:
{
  "findings": [
    {
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "category": "Risk Assessment",
      "title": "Overall Risk Summary",
      "description": "comprehensive risk assessment",
      "evidence": ["key risk factors"],
      "recommendations": ["prioritized actions"]
    }
  ],
  "confidence": 0.0-1.0,
  "reasoning": "synthesis of all agent findings",
  "risk_score": 0-100,
  "recommendation": "GO|NO_GO|CONDITIONAL"
}

Only return valid JSON, no other text.`;

  const response = await callGemini(prompt);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        agent: 'Risk Analysis Agent',
        findings: parsed.findings || [],
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'Analysis complete'
      };
    }
  } catch (e) {
    console.error('Error parsing risk response:', e);
  }
  
  return {
    agent: 'Risk Analysis Agent',
    findings: [],
    confidence: 0.5,
    reasoning: 'Unable to parse response'
  };
}

// POST - Analyze document with all agents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document_id, text, run_agents } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    const agents = run_agents || ['consistency', 'greenwashing', 'compliance', 'math', 'risk'];
    const results: AgentResult[] = [];
    const allFindings: any[] = [];

    // Run agents sequentially (risk agent needs previous results)
    for (const agent of agents) {
      let result: AgentResult;
      const startTime = Date.now();

      switch (agent) {
        case 'consistency':
          result = await runConsistencyAgent(text);
          break;
        case 'greenwashing':
          result = await runGreenwashingAgent(text);
          break;
        case 'compliance':
          result = await runComplianceAgent(text);
          break;
        case 'math':
          result = await runMathAgent(text);
          break;
        case 'risk':
          result = await runRiskAgent(text, allFindings);
          break;
        default:
          continue;
      }

      const executionTime = Date.now() - startTime;
      results.push(result);
      allFindings.push(...result.findings);

      // Store execution record if document_id provided
      if (document_id) {
        await supabase.from('agent_executions').insert({
          document_id,
          agent_name: result.agent,
          status: 'completed',
          execution_time: executionTime / 1000,
          findings_count: result.findings.length,
          confidence_score: result.confidence
        });

        // Store findings
        for (const finding of result.findings) {
          await supabase.from('findings').insert({
            document_id,
            agent_type: result.agent,
            severity: finding.severity?.toLowerCase() || 'medium',
            category: finding.category || 'General',
            title: finding.title || 'Finding',
            description: finding.description || '',
            evidence: finding.evidence || [],
            recommendations: finding.recommendations || [],
            confidence_score: result.confidence
          });
        }
      }
    }

    // Update document status
    if (document_id) {
      await supabase
        .from('documents')
        .update({ processing_status: 'completed' })
        .eq('id', document_id);
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total_findings: allFindings.length,
        critical: allFindings.filter(f => f.severity === 'CRITICAL').length,
        high: allFindings.filter(f => f.severity === 'HIGH').length,
        medium: allFindings.filter(f => f.severity === 'MEDIUM').length,
        low: allFindings.filter(f => f.severity === 'LOW').length
      }
    });

  } catch (error: any) {
    console.error('Error in analysis:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
