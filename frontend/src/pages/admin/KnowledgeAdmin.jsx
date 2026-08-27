/**
 * src/pages/admin/KnowledgeAdmin.jsx — Admin Knowledge Repository Manager
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Search,
  Award,
  Download,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getResourcesApi,
  createResourceApi,
  updateResourceApi,
  deleteResourceApi,
} from '../../api/knowledge.api';
import { getCompetenciesApi } from '../../api/competency.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function KnowledgeAdmin() {
  const [resources, setResources] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resData, compsData] = await Promise.all([
        getResourcesApi({ search: search || undefined }),
        getCompetenciesApi(),
      ]);
      setResources(resData);
      setCompetencies(compsData);
    } catch (err) {
      toast.error('Failed to load knowledge resources');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const openCreateModal = () => {
    setEditingResource(null);
    reset({
      title: '',
      category: 'SOP',
      description: '',
      competencyId: '',
      fileUrl: '/uploads/sample-asset.pdf',
      fileType: 'PDF',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (res) => {
    setEditingResource(res);
    setValue('title', res.title);
    setValue('category', res.category);
    setValue('description', res.description || '');
    setValue('competencyId', res.competencyId || '');
    setValue('fileUrl', res.fileUrl || '');
    setValue('fileType', res.fileType || 'PDF');
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        competencyId: data.competencyId || null,
      };

      if (editingResource) {
        await updateResourceApi(editingResource.id, payload);
        toast.success('Resource updated successfully');
      } else {
        await createResourceApi(payload);
        toast.success('Knowledge asset published');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteResourceApi(deleteTarget.id);
      toast.success('Resource deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete resource');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Knowledge Hub & Asset Repository</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Publish, manage, and tag organization SOPs, whitepapers, and best practice documents
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Publish Asset
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, description, category..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Resources Table */}
      {isLoading ? (
        <LoadingSpinner text="Loading knowledge repository..." />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No knowledge assets found"
          description="Publish your first organizational SOP or guideline to start building the library."
          icon={FileText}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Asset Title</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Tagged Competency</th>
                  <th className="px-4 py-3.5">Downloads</th>
                  <th className="px-4 py-3.5">Format</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{res.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{res.description}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {res.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-600">
                      {res.competency?.name || <span className="text-slate-400 italic">General</span>}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700">
                      {res.downloadsCount || 0}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-semibold uppercase">
                      {res.fileType || 'PDF'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(res)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(res)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingResource ? 'Edit Knowledge Asset' : 'Publish Knowledge Asset'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. PostgreSQL Query Optimization SOP"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="SOP">SOP</option>
                    <option value="BEST_PRACTICE">Best Practice</option>
                    <option value="TECHNICAL_DOC">Technical Doc</option>
                    <option value="POLICY">Policy</option>
                    <option value="TEMPLATE">Template</option>
                    <option value="WHITEPAPER">Whitepaper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tagged Competency
                  </label>
                  <select
                    {...register('competencyId')}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">None (General)</option>
                    {competencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document / Asset URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /uploads/sql-optimization.pdf"
                  {...register('fileUrl')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of organizational knowledge contained..."
                  {...register('description')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingResource ? 'Save Changes' : 'Publish Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Knowledge Asset"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Delete Asset"
        isLoading={isDeleting}
      />
    </div>
  );
}
