"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Brain, 
  FileText, 
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Plus
} from "lucide-react";

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  processing_status: string;
  upload_timestamp: string;
  metadata?: any;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
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

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3" /> Completed</span>;
      case "processing": 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><RefreshCw className="w-3 h-3 animate-spin" /> Processing</span>;
      case "failed": 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><AlertTriangle className="w-3 h-3" /> Failed</span>;
      default: 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-500">Loading documents...</p>
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
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold tracking-tight">Documents</span>
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
                <Plus className="w-4 h-4" />
                New Document
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
        {documents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h2>
            <p className="text-gray-500 mb-6">Upload and analyze your first document to get started</p>
            <Link 
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-full font-medium transition-colors shadow-sm"
            >
              <Brain className="w-5 h-5" />
              Analyze Document
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="text-3xl font-bold text-gray-900">{documents.length}</div>
                <div className="text-sm text-gray-500">Total Documents</div>
              </div>
              <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                <div className="text-3xl font-bold text-green-700">
                  {documents.filter(d => d.processing_status === 'completed').length}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
                <div className="text-3xl font-bold text-blue-700">
                  {documents.filter(d => d.processing_status === 'processing').length}
                </div>
                <div className="text-sm text-blue-600">Processing</div>
              </div>
              <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
                <div className="text-3xl font-bold text-amber-700">
                  {documents.filter(d => d.processing_status === 'pending').length}
                </div>
                <div className="text-sm text-amber-600">Pending</div>
              </div>
            </div>

            {/* Document List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-900">{doc.filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{doc.file_type}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatFileSize(doc.file_size)}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(doc.processing_status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(doc.upload_timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/findings?document_id=${doc.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Findings"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
