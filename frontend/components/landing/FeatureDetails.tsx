import React from 'react';
import { ShieldCheck, UserCheck, Bot, Sparkles, Sliders, Search, Globe, MessageSquare, FileText, Network, Brain, AlertTriangle } from 'lucide-react';

const FeatureDetails: React.FC = () => {
  return (
    <div className="py-24 space-y-32 bg-white">
      
      {/* Feature 1: MCP Hub & Agent Orchestration */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold mb-6 bg-indigo-50 px-3 py-1 rounded-full text-sm">
              <Brain size={16} />
              <span>Cognitive Risk Engine</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              MCP Hub with Multi-Agent Orchestration.
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              The Model Context Protocol (MCP) Hub coordinates specialized AI agents through AWS Step Functions. 
              Amazon Bedrock with Titan Text Premier provides chain-of-thought reasoning for complex analysis tasks.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-blue-100 p-1 rounded text-blue-600"><Bot size={16}/></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Specialized Agents</h4>
                  <p className="text-gray-500 text-sm">Math, Compliance, Greenwashing, and Risk Analysis agents work in parallel.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-blue-100 p-1 rounded text-blue-600"><Network size={16}/></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Universal Tool Access</h4>
                  <p className="text-gray-500 text-sm">Connect to external APIs, application databases, and vector stores seamlessly.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 relative">
             <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 shadow-2xl relative z-10">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                   <div>
                      <h3 className="font-bold text-gray-900">Agent Orchestrator</h3>
                      <p className="text-sm text-gray-500">4 Agents Active</p>
                   </div>
                   <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">Running</span>
                </div>
                <div className="space-y-4">
                   <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                      <div>
                         <p className="font-semibold text-sm">Math & Consistency Agent</p>
                         <p className="text-xs text-gray-500">Validating financial projections</p>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded font-medium">Processing</span>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                      <div>
                         <p className="font-semibold text-sm">Compliance Check Agent</p>
                         <p className="text-xs text-gray-500">Checking regional regulations</p>
                      </div>
                      <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded font-medium">Complete</span>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between opacity-60">
                      <div>
                         <p className="font-semibold text-sm">Greenwashing Detector</p>
                         <p className="text-xs text-gray-500">Analyzing ESG claims</p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded font-medium">Queued</span>
                   </div>
                </div>
             </div>
             {/* Decorative blob */}
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>

      {/* Feature 2: Knowledge Graph & RAG */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold mb-6 bg-emerald-50 px-3 py-1 rounded-full text-sm">
              <Network size={16} />
              <span>Hierarchical Knowledge Layer</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              RAG-Powered Knowledge Graphs.
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Build semantic relationships between entities, risks, and compliance requirements using 
              Amazon OpenSearch Serverless for vector storage and Kiro Spec-Driven ingestion pipelines.
            </p>
             <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-emerald-100 p-1 rounded text-emerald-600"><FileText size={16}/></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Document Understanding</h4>
                  <p className="text-gray-500 text-sm">Extract entities, relationships, and key facts from complex documents.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-emerald-100 p-1 rounded text-emerald-600"><Search size={16}/></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Semantic Search</h4>
                  <p className="text-gray-500 text-sm">Query the knowledge base with natural language for instant insights.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 relative">
             {/* Knowledge Graph UI Simulation */}
             <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden font-mono text-sm relative p-6">
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   <span className="text-gray-500 text-xs ml-2">knowledge_graph.cypher</span>
                </div>
                <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
<span className="text-purple-400">MATCH</span> (doc:<span className="text-blue-400">Document</span>)
  -[:<span className="text-yellow-400">CONTAINS</span>]-&gt;(entity:<span className="text-blue-400">Entity</span>)
  -[:<span className="text-yellow-400">HAS_RISK</span>]-&gt;(risk:<span className="text-blue-400">Risk</span>)
<span className="text-purple-400">WHERE</span> risk.severity &gt; <span className="text-green-400">0.7</span>
<span className="text-purple-400">RETURN</span> doc.name, entity.type, 
       risk.category, risk.score

<span className="text-gray-500">// Results: 12 high-risk entities found</span>
                </pre>
                <div className="mt-4 flex gap-2 flex-wrap">
                   <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">Financial Risk: 3</span>
                   <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">Compliance Gap: 5</span>
                   <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">ESG Concern: 4</span>
                </div>
             </div>
             <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>

      {/* Feature 3: Risk Heatmap Output */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-orange-600 font-semibold mb-6 bg-orange-50 px-3 py-1 rounded-full text-sm">
              <AlertTriangle size={16} />
              <span>Decision Support</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Risk Heatmap & Go/No-Go Recommendations.
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Get visual risk assessments and actionable recommendations for investment committees. 
              Multi-language support via Amazon Translate ensures global accessibility.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-orange-100 p-1 rounded text-orange-600"><ShieldCheck size={16}/></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Automated Risk Scoring</h4>
                  <p className="text-gray-500 text-sm">Consistent, objective risk assessment across all proposals.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-orange-100 p-1 rounded text-orange-600"><Globe size={16}/></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Localization Support</h4>
                  <p className="text-gray-500 text-sm">Process documents in multiple languages with real-time translation.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 relative">
             <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl relative z-10">
                <h3 className="font-bold text-gray-900 mb-6">Risk Assessment Summary</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                   {[
                     { label: "Financial", score: 0.3, color: "bg-green-500" },
                     { label: "Regulatory", score: 0.6, color: "bg-yellow-500" },
                     { label: "ESG", score: 0.8, color: "bg-red-500" },
                     { label: "Technical", score: 0.4, color: "bg-green-500" },
                     { label: "Market", score: 0.5, color: "bg-yellow-500" },
                     { label: "Operational", score: 0.2, color: "bg-green-500" },
                   ].map((item, i) => (
                     <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className={`w-full h-2 rounded-full bg-gray-200 mb-2`}>
                           <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-600">{item.label}</p>
                        <p className="text-sm font-bold text-gray-900">{(item.score * 100).toFixed(0)}%</p>
                     </div>
                   ))}
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                   <div>
                      <p className="font-bold text-gray-900">Recommendation</p>
                      <p className="text-sm text-gray-600">Proceed with caution - ESG concerns require review</p>
                   </div>
                   <span className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold text-sm">CONDITIONAL GO</span>
                </div>
             </div>
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-orange-100 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FeatureDetails;
