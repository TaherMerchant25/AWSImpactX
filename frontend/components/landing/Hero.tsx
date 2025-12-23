import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Brain, ShieldCheck, FileSearch, Network } from 'lucide-react';
import { Globe } from '../ui/globe';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text Content */}
          <div className="max-w-4xl z-20 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-medium text-gray-800 mb-8 hover:bg-gray-200 transition-colors cursor-pointer">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              AI-Powered Due Diligence Pipeline
              <ArrowRight size={12} />
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-8">
              Intelligent Risk <br className="hidden sm:block" />
              <span className="text-gray-500">Analysis Platform.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              Transform complex due diligence with AI agents that analyze documents, detect greenwashing, 
              verify compliance, and build hierarchical knowledge graphs for informed investment decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/analyze" className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-transform active:scale-95 text-center">
                Start Analysis
              </Link>
              <Link href="/dashboard" className="border-2 border-gray-200 text-gray-800 px-8 py-4 rounded-full font-medium hover:border-black transition-colors text-center">
                View Dashboard
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-8 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <FileSearch className="text-black" size={16} />
                <span>Document Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="text-black" size={16} />
                <span>Multi-Agent Reasoning</span>
              </div>
              <div className="flex items-center gap-2">
                <Network className="text-black" size={16} />
                <span>Knowledge Graphs</span>
              </div>
               <div className="flex items-center gap-2">
                <ShieldCheck className="text-black" size={16} />
                <span>Compliance Checking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Globe Animation */}
          <div className="hidden lg:block relative h-[600px] w-full -mr-20 pointer-events-none select-none">
             <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/5 z-10" />
             <Globe className="scale-125 translate-x-12" />
          </div>

        </div>
      </div>
      
      {/* Abstract Background Element (Subtler now) */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-50/50 to-transparent rounded-full blur-3xl opacity-40 -z-10 pointer-events-none"></div>
    </section>
  );
};

export default Hero;
