"use client";

import React, { useState, useEffect } from "react";
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
  Clock,
  TrendingUp,
  Loader2,
  Shield,
  Leaf,
  Calculator,
  Scale,
  ChevronRight,
  BarChart3
} from "lucide-react";

interface Finding {
  id: string;
  severity: string;
  category: string;
  title: string;
  description: string;
  agent_type: string;
  confidence_score: number;
  created_at: string;
}

interface AgentStat {
  name: string;
  status: string;
  lastRun: string | null;
  totalRuns: number;
  avgConfidence: number;
}

interface Stats {
  documents: {
    total: number;
    completed: number;
    processing: number;
    pending: number;
  };
  findings: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    recentWeek: number;
  };
  agents: AgentStat[];
  performance: {
    avgProcessingTime: number;
    totalExecutions: number;
  };
}

const agentIcons: Record<string, React.ReactNode> = {
  "Consistency Agent": <Scale className="w-5 h-5" />,
  "Greenwashing Detector": <Leaf className="w-5 h-5" />,
  "Compliance Agent": <Shield className="w-5 h-5" />,
  "Math Agent": <Calculator className="w-5 h-5" />,
  "Risk Analysis Agent": <BarChart3 className="w-5 h-5" />,
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const findingsRes = await fetch('/api/findings?limit=10');
      const findingsData = await findingsRes.json();
      setFindings(findingsData.findings || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getSeverityColor = (severity: string) => {
    const sev = severity?.toUpperCase();
    switch (sev) {
      case "CRITICAL": return "text-red-600 bg-red-50 border-red-200";
      case "HIGH": return "text-orange-600 bg-orange-50 border-orange-200";
      case "MEDIUM": return "text-amber-600 bg-amber-50 border-amber-200";
      case "LOW": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": 
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3" /> Active</span>;
      case "running": 
      case "processing": 
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><RefreshCw className="w-3 h-3 animate-spin" /> Running</span>;
      case "failed":
      case "error": 
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><AlertTriangle className="w-3 h-3" /> Error</span>;
      default: 
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200"><Activity className="w-3 h-3" /> Idle</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold tracking-tight">ASPERA</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 text-sm font-medium rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link 
                href="/analyze"
                className="px-4 py-2 text-sm font-medium rounded-full bg-black text-white hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Analyze Document
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor your document analysis and agent activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Documents</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.documents?.completed || 0}</div>
            <p className="text-sm text-gray-500 mt-1">
              {stats?.documents?.processing || 0} processing • {stats?.documents?.pending || 0} pending
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Critical Issues</span>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.findings?.critical || 0}</div>
            <p className="text-sm text-gray-500 mt-1">
              {(stats?.findings?.critical || 0) > 0 ? 'Requires attention' : 'No critical issues'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Total Findings</span>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.findings?.total || 0}</div>
            <p className="text-sm text-gray-500 mt-1">
              +{stats?.findings?.recentWeek || 0} this week
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Avg Processing</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.performance?.avgProcessingTime ? `${stats.performance.avgProcessingTime}s` : '-'}
            </div>
            <p className="text-sm text-gray-500 mt-1">Per agent analysis</p>
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Findings by Severity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="text-sm font-medium text-red-700 mb-1">Critical</div>
              <div className="text-2xl font-bold text-red-700">{stats?.findings?.critical || 0}</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <div className="text-sm font-medium text-orange-700 mb-1">High</div>
              <div className="text-2xl font-bold text-orange-700">{stats?.findings?.high || 0}</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="text-sm font-medium text-amber-700 mb-1">Medium</div>
              <div className="text-2xl font-bold text-amber-700">{stats?.findings?.medium || 0}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-sm font-medium text-blue-700 mb-1">Low</div>
              <div className="text-2xl font-bold text-blue-700">{stats?.findings?.low || 0}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Agent Status */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Agents
              </h2>
              <div className="space-y-4">
                {stats?.agents?.map((agent, index) => (
                  <div key={index} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700">
                          {agentIcons[agent.name] || <Brain className="w-5 h-5" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                      </div>
                      {getStatusBadge(agent.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                      <span>{agent.totalRuns} runs</span>
                      <span>{(agent.avgConfidence * 100).toFixed(0)}% confidence</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="h-1.5 rounded-full bg-black transition-all"
                        style={{ width: `${agent.avgConfidence * 100}%` }}
                      />
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-sm text-center py-8">No agent data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Findings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Findings
                </h2>
                <Link 
                  href="/findings"
                  className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              {findings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No findings yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    <Link href="/analyze" className="text-black font-medium hover:underline">
                      Analyze a document
                    </Link>
                    {" "}to see findings here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getSeverityColor(finding.severity)}`}>
                              {finding.severity?.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">{finding.category}</span>
                          </div>
                          <h3 className="text-gray-900 font-medium mb-1 group-hover:text-black">{finding.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{finding.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                            <span className="flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              {finding.agent_type}
                            </span>
                            <span>{((finding.confidence_score || 0) * 100).toFixed(0)}% confidence</span>
                            <span>{new Date(finding.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/analyze"
            className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Analyze New Document</h3>
            <p className="text-sm text-gray-500">Upload and analyze a document with all 5 AI agents</p>
          </Link>
          
          <Link 
            href="/documents"
            className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">View Documents</h3>
            <p className="text-sm text-gray-500">Browse all uploaded documents and their status</p>
          </Link>
          
          <Link 
            href="/findings"
            className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">All Findings</h3>
            <p className="text-sm text-gray-500">Review all findings across all documents</p>
          </Link>
        </div>

        {/* CTA Section */}
        <div className="mt-8 rounded-2xl bg-black text-white p-8 md:p-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to analyze more documents?</h2>
            <p className="text-gray-400 mb-6">Upload your ESG reports, sustainability documents, and financial statements for comprehensive AI-powered analysis.</p>
            <Link 
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Start Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
