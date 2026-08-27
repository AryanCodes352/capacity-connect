/**
 * src/pages/employee/KnowledgeHub.jsx — Employee Organizational Knowledge Hub
 */

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Download,
  BookOpen,
  Award,
  ExternalLink,
  Shield,
  FileCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getResourcesApi, getResourceByIdApi } from '../../api/knowledge.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function KnowledgeHub() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const data = await getResourcesApi({
        search: search || undefined,
        category: categoryFilter || undefined,
      });
      setResources(data);
    } catch (err) {
      toast.error('Failed to load knowledge assets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [search, categoryFilter]);

  const handleOpenResource = async (res) => {
    try {
      await getResourceByIdApi(res.id);
      setSelectedResource(res);
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'SOP': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'BEST_PRACTICE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'TECHNICAL_DOC': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'POLICY': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'TEMPLATE': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 lg:p-8 text-white shadow-md border border-slate-800">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/20">
            <FileText className="w-3.5 h-3.5" />
            Centralized Organizational Repository
          </span>
          <h1 className="text-2xl font-bold">Knowledge Hub & Technical Library</h1>
          <p className="text-xs lg:text-sm text-slate-300 max-w-xl">
            Access verified Standard Operating Procedures, architectural whitepapers, coding guidelines, and competency reference templates.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SOPs, whitepapers, best practices, tags..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Categories</option>
          <option value="SOP">SOP</option>
          <option value="BEST_PRACTICE">Best Practice</option>
          <option value="TECHNICAL_DOC">Technical Doc</option>
          <option value="POLICY">Policy</option>
          <option value="TEMPLATE">Template</option>
          <option value="WHITEPAPER">Whitepaper</option>
        </select>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <LoadingSpinner text="Loading organizational knowledge repository..." />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No resources found"
          description="Try searching with different keywords or category filters."
          icon={FileText}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(res.category)}`}>
                    {res.category?.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {res.fileType || 'PDF'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1 mb-1 line-clamp-2">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {res.description || 'Organizational asset published for capability building and standardized practices.'}
                </p>

                {/* Target Competency Tag */}
                {res.competency && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold border border-blue-100">
                      <Award className="w-3 h-3" />
                      {res.competency.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {res.downloadsCount || 0} Downloads
                </span>

                <button
                  onClick={() => handleOpenResource(res)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Asset</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asset Preview Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-1.5 ${getCategoryBadge(selectedResource.category)}`}>
                  {selectedResource.category?.replace('_', ' ')}
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedResource.title}</h3>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {selectedResource.description}
            </p>

            {selectedResource.competency && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Tagged Competency: <strong>{selectedResource.competency.name}</strong></span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <a
                href={selectedResource.fileUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Document
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
