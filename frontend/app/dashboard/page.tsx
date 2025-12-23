"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Brain, 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  ArrowLeft,
  RefreshCw,
  Download
} from "lucide-react";

interface Finding {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  title: string;
  agent: string;
  confidence: number;
}

interface AgentStatus {
  name: string;
  status: "idle" | "processing" | "completed" | "error";
  progress: number;
}

export default function Dashboard() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { name: "Consistency Agent", status: "completed", progress: 100 },
    { name: "Greenwashing Detector", status: "completed", progress: 100 },
    { name: "Compliance Agent", status: "processing", progress: 67 },
    { name: "Math Agent", status: "idle", progress: 0 },
    { name: "Risk Analysis Agent", status: "idle", progress: 0 },
  ]);

  const findings: Finding[] = [
    {
      id: "1",
      severity: "CRITICAL",
      category: "Financial Discrepancy",
      title: "Revenue projections inconsistent with market data",
      agent: "Consistency Agent",
      confidence: 0.94
    },
    {
      id: "2",
      severity: "HIGH",
      category: "Greenwashing",
      title: "Unsubstantiated carbon neutrality claims",
      agent: "Greenwashing Detector",
      confidence: 0.87
    },
    {
      id: "3",
      severity: "MEDIUM",
      category: "Compliance",
      title: "Missing regulatory disclosure in Section 4.2",
      agent: "Compliance Agent",
      confidence: 0.76
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "HIGH": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "LOW": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "processing": return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case "error": return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5" />
                <Brain className="w-6 h-6" />
                <span className="text-xl font-semibold">ASPERA Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm rounded-md bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Documents Processed</span>
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <div className="text-3xl font-semibold text-white">24</div>
            <div className="text-xs text-green-400 mt-1">+3 this week</div>
          </div>

          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Critical Findings</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-semibold text-white">3</div>
            <div className="text-xs text-red-400 mt-1">Requires attention</div>
          </div>

          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Agents</span>
              <Brain className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-semibold text-white">5</div>
            <div className="text-xs text-blue-400 mt-1">All operational</div>
          </div>

          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Processing Time</span>
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-semibold text-white">2.4m</div>
            <div className="text-xs text-gray-400 mt-1">Per document</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Status */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Agent Status
              </h2>
              <div className="space-y-4">
                {agentStatuses.map((agent, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(agent.status)}
                        <span className="text-sm text-white">{agent.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{agent.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          agent.status === "completed" ? "bg-green-500" :
                          agent.status === "processing" ? "bg-blue-500" :
                          agent.status === "error" ? "bg-red-500" :
                          "bg-gray-600"
                        }`}
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Findings List */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Findings
                </h2>
                <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
              <div className="space-y-4">
                {findings.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-4 rounded-lg border border-gray-800 bg-black/50 hover:bg-black transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          <span className="text-xs text-gray-500">{finding.category}</span>
                        </div>
                        <h3 className="text-white font-medium mb-1">{finding.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Agent: {finding.agent}</span>
                          <span>Confidence: {(finding.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Heatmap Placeholder */}
        <div className="mt-6">
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Risk Heatmap
            </h2>
            <div className="h-64 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-500">Risk visualization will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
