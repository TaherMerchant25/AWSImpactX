import React from 'react';
import { FileText, Network, ShieldAlert, Bot, Brain, Zap, Search, AlertTriangle, BarChart3 } from 'lucide-react';

const BentoCard: React.FC<{ 
  title: string; 
  description: React.ReactNode; 
  icon: React.ReactNode; 
  className?: string;
  bgContent?: React.ReactNode;
}> = ({ title, description, icon, className = "", bgContent }) => (
  <div className={`relative overflow-hidden rounded-3xl bg-gray-50 border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-300 group ${className}`}>
    <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
      <div className="mb-8">
        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 text-gray-900 shadow-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="text-gray-500 text-sm leading-relaxed">{description}</div>
      </div>
    </div>
    {bgContent}
  </div>
);

const BentoGrid: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
            Everything you need for <br />
            <span className="text-gray-500">intelligent due diligence.</span>
          </h2>
          <p className="text-lg text-gray-600">
             ASPERA combines document processing, knowledge graphs, and multi-agent AI reasoning 
             to transform how investment committees evaluate complex deals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Large Card 1 - Document Processing */}
          <BentoCard 
            title="Intelligent Document Ingestion" 
            description={
              <span className="block md:max-w-[50%]">
                Process PDFs, feasibility studies, and blueprints with Amazon Textract OCR. Extract structured data automatically.
              </span>
            }
            icon={<FileText size={20} />}
            className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50"
            bgContent={
               <div className="absolute right-0 bottom-0 w-[260px] md:w-[320px] h-[180px] md:h-[220px] translate-x-8 translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500">
                 <div className="bg-white rounded-tl-2xl border-t border-l border-gray-200 shadow-xl p-5 h-full flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                       <span className="text-[10px] font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded">PROCESSING</span>
                       <span className="text-[10px] text-gray-400">S3: Deal-Flow</span>
                    </div>
                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-blue-200 rounded animate-pulse"></div>
                        <div className="h-1.5 w-5/6 bg-gray-100 rounded"></div>
                        <div className="h-1.5 w-4/6 bg-gray-100 rounded"></div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                        <span className="bg-green-50 text-green-600 text-[10px] px-3 py-1.5 rounded">Tables Extracted</span>
                        <span className="bg-gray-50 text-gray-600 text-[10px] px-3 py-1.5 rounded">JSON Ready</span>
                    </div>
                 </div>
               </div>
            }
          />

          {/* Card 2 - Knowledge Graph */}
          <BentoCard 
            title="Hierarchical Knowledge Graph" 
            description="Build semantic relationships between entities, risks, and compliance requirements."
            icon={<Network size={20} />}
            className="bg-white"
          />

          {/* Card 3 - AI Agents (Dark) */}
          <div className={`relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-800 p-8 hover:shadow-lg transition-shadow duration-300 group md:row-span-2`}>
                <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
                <div className="mb-8">
                    <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-4 text-white shadow-sm">
                    <Bot size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Multi-Agent Reasoning</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Specialized AI agents work together: Math verification, Compliance checking, Greenwashing detection, and Risk analysis.
                    </p>
                </div>
                {/* Agent Activity Graphic */}
                <div className="flex flex-col gap-3 mt-4 font-mono text-xs">
                    {[
                      {text: "Math Agent: Validating financials...", color: "text-blue-400"},
                      {text: "Compliance Agent: Checking regulations...", color: "text-green-400"},
                      {text: "Greenwashing Detector: Analyzing claims...", color: "text-purple-400"},
                      {text: "Risk Agent: Generating heatmap...", color: "text-orange-400"},
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            <div className={`w-2 h-2 rounded-full ${step.color.replace('text-', 'bg-')}`}></div>
                            <span className="text-gray-300">{step.text}</span>
                        </div>
                    ))}
                </div>
                </div>
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          </div>

          {/* Card 4 - Greenwashing Detection */}
          <BentoCard 
            title="Greenwashing Detection" 
            description="AI-powered analysis to identify misleading sustainability claims in proposals."
            icon={<AlertTriangle size={20} />}
            className="bg-white"
          />

          {/* Card 5 - Risk Heatmap */}
          <BentoCard 
            title="Risk Heatmap & Recommendations" 
            description="Visual risk assessment with Go/No-Go recommendations for investment committees."
            icon={<BarChart3 size={20} />}
            className="bg-white"
          />

        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
