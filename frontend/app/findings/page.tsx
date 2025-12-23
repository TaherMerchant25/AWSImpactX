"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  AlertTriangle, 
  ArrowLeft,
  RefreshCw,
  Loader2,
  Filter,
  Brain,
  FileText,
  ChevronRight
} from "lucide-react";

interface Finding {
  id: string;
  document_id: string;
  agent_type: string;
  severity: string;
  category: string;
  title: string;
  description: string;
  evidence: string[];
  recommendations: string[];
  confidence_score: number;
  created_at: string;
}

export default function FindingsPage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('document_id');
  
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchFindings = async () => {
    try {
      let url = '/api/findings?limit=100';
      if (documentId) {
        url += `&document_id=${documentId}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setFindings(data.findings || []);
    } catch (error) {
      console.error('Error fetching findings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [documentId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFindings();
  };

  const getSeverityColor = (severity: string) => {
    const sev = severity?.toLowerCase();
    switch (sev) {
      case "critical": return "text-red-700 bg-red-50 border-red-200";
      case "high": return "text-orange-700 bg-orange-50 border-orange-200";
      case "medium": return "text-amber-700 bg-amber-50 border-amber-200";
      case "low": return "text-blue-700 bg-blue-50 border-blue-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const filteredFindings = findings.filter(f => {
    if (filterSeverity !== 'all' && f.severity?.toLowerCase() !== filterSeverity) return false;
    if (filterAgent !== 'all' && !f.agent_type?.toLowerCase().includes(filterAgent.toLowerCase())) return false;
    return true;
  });

  const uniqueAgents = [...new Set(findings.map(f => f.agent_type).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-500">Loading findings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200" : "bg-white border-b border-gray-100"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold tracking-tight">
                  {documentId ? 'Document Findings' : 'All Findings'}
                </span>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 text-sm font-medium rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            >
              <option value="all">All Agents</option>
              {uniqueAgents.map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>

            <span className="text-sm text-gray-500 ml-auto">
              Showing {filteredFindings.length} of {findings.length} findings
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{findings.length}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
            <div className="text-3xl font-bold text-red-700">
              {findings.filter(f => f.severity?.toLowerCase() === 'critical').length}
            </div>
            <div className="text-sm text-red-600">Critical</div>
          </div>
          <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
            <div className="text-3xl font-bold text-orange-700">
              {findings.filter(f => f.severity?.toLowerCase() === 'high').length}
            </div>
            <div className="text-sm text-orange-600">High</div>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
            <div className="text-3xl font-bold text-amber-700">
              {findings.filter(f => f.severity?.toLowerCase() === 'medium').length}
            </div>
            <div className="text-sm text-amber-600">Medium</div>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <div className="text-3xl font-bold text-blue-700">
              {findings.filter(f => f.severity?.toLowerCase() === 'low').length}
            </div>
            <div className="text-sm text-blue-600">Low</div>
          </div>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No findings found</h2>
            <p className="text-gray-500 mb-6">
              {findings.length === 0 
                ? "Analyze documents to generate findings"
                : "No findings match your current filters"}
            </p>
            {findings.length === 0 && (
              <Link 
                href="/analyze"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-full font-medium transition-colors shadow-sm"
              >
                <Brain className="w-5 h-5" />
                Analyze Document
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(finding.severity)}`}>
                      {finding.severity?.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{finding.category}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(finding.created_at).toLocaleString()}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{finding.title}</h3>
                <p className="text-gray-600 mb-4">{finding.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                    <Brain className="w-4 h-4" />
                    {finding.agent_type}
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    Confidence: {((finding.confidence_score || 0) * 100).toFixed(0)}%
                  </span>
                </div>

                {(finding.evidence?.length > 0 || finding.recommendations?.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finding.evidence?.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Evidence</h4>
                        <ul className="text-sm text-gray-600 space-y-1.5">
                          {finding.evidence.map((ev, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              {ev}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {finding.recommendations?.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-blue-700 mb-2">Recommendations</h4>
                        <ul className="text-sm text-blue-700 space-y-1.5">
                          {finding.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
