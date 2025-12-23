"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Shield, Zap, ArrowRight } from "lucide-react";
import DotPattern from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AsperaHeroSection() {
  return (
    <section className="relative w-full min-h-[100vh] flex flex-col items-center justify-center px-6 py-24 overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <DotPattern 
        className={cn(
          "[mask-image:radial-gradient(40vw_circle_at_center,white,transparent)]",
          "fill-gray-300/50"
        )} 
      />
      
      {/* Gradient orbs - light theme */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.4 }}
        className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-400/20 blur-[120px] rounded-full z-0"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.3 }}
        className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-indigo-400/15 blur-[160px] rounded-full z-0"
      />

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 0.3, y: [0, -20, 0] }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute w-1 h-1 bg-gray-400/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-3xl space-y-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-gray-200 text-sm font-medium text-gray-700">
            <Zap className="w-4 h-4 text-blue-600" />
            Powered by Gemini AI
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-gray-900"
        >
          AI-Powered
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Due Diligence
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          ASPERA analyzes financial documents, detects greenwashing, ensures compliance,
          and delivers actionable insights with 5 specialized AI agents.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex justify-center gap-4 flex-wrap"
        >
          <Link href="/analyze">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white gap-2">
              Start Analyzing
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
              View Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex justify-center gap-12 flex-wrap"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">5</div>
            <div className="text-sm text-gray-500">AI Agents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">99%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">97%</div>
            <div className="text-sm text-gray-500">Cost Savings</div>
          </div>
        </motion.div>
      </div>

      {/* Feature cards */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-20 w-full max-w-5xl gap-4"
      >
        {[
          { icon: <Brain className="w-6 h-6" />, title: "Multi-Agent AI", desc: "5 specialized agents working together" },
          { icon: <FileText className="w-6 h-6" />, title: "Document Analysis", desc: "PDF, TXT, DOC support" },
          { icon: <Shield className="w-6 h-6" />, title: "Compliance Check", desc: "Regulatory verification" },
          { icon: <Zap className="w-6 h-6" />, title: "Instant Results", desc: "Real-time processing" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="group flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg hover:border-gray-300 p-6"
          >
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-gray-100 rounded-xl text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
              {item.icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900 text-center">{item.title}</h3>
            <p className="text-sm text-gray-500 text-center mt-1">{item.desc}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
