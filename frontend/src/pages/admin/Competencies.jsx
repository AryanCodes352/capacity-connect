/**
 * src/pages/admin/Competencies.jsx — Competency Catalog Management
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Search,
  Tag,
  BookOpen,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getCompetenciesApi,
  getCompetencyCategoriesApi,
  createCompetencyApi,
  updateCompetencyApi,
  deleteCompetencyApi,
} from '../../api/competency.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function Competencies() {
  const [competencies, setCompetencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchCompetencies = async () => {
    try {
      setIsLoading(true);
      const [compsData, catsData] = await Promise.all([
        getCompetenciesApi({
          category: categoryFilter || undefined,
          search: search || undefined,
        }),
        getCompetencyCategoriesApi(),
      ]);
      setCompetencies(compsData);
      setCategories(catsData);
    } catch (err) {
      toast.error('Failed to load competencies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetencies();
  }, [categoryFilter, search]);

  const openCreateModal = () => {
    setEditingComp(null);
    reset({
      name: '',
      category: 'Technical',
      description: '',
      maxLevel: 4,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (comp) => {
    setEditingComp(comp);
    setValue('name', comp.name);
    setValue('category', comp.category || 'Technical');
    setValue('description', comp.description || '');
    setValue('maxLevel', comp.maxLevel || 4);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingComp) {
        await updateCompetencyApi(editingComp.id, data);
        toast.success('Competency updated successfully');
      } else {
        await createCompetencyApi(data);
        toast.success('Competency added to catalog');
      }
      setIsModalOpen(false);
      fetchCompetencies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteCompetencyApi(deleteTarget.id);
      toast.success('Competency removed from catalog');
      setDeleteTarget(null);
      fetchCompetencies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete competency');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'technical': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'soft skills': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'leadership': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Competency Framework</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage organizational skill taxonomy, competency definitions, and proficiency scales
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Competency
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search competencies or descriptions..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingSpinner text="Loading competency catalog..." />
      ) : competencies.length === 0 ? (
        <EmptyState
          title="No competencies found"
          description={search ? 'No competencies match your filter criteria.' : 'Create your first competency to begin defining organizational capabilities.'}
          icon={Award}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {competencies.map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border mb-1.5 ${getCategoryColor(comp.category)}`}>
                      {comp.category || 'General'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">{comp.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(comp)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(comp)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-2 mb-4">
                  {comp.description || 'No description provided.'}
                </p>

                {/* Level Scale Indicator */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mb-4">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1.5">
                    <span>Proficiency Scale</span>
                    <span>1 to Level {comp.maxLevel}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1.5 rounded-full ${
                          lvl <= comp.maxLevel ? 'bg-blue-500' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Associations Metrics */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                <div className="bg-slate-50 p-1.5 rounded-md">
                  <p className="font-bold text-slate-800">{comp._count?.roleCompetencies || 0}</p>
                  <p className="text-[10px] text-slate-400">Roles</p>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-md">
                  <p className="font-bold text-slate-800">{comp._count?.courseCompetencies || 0}</p>
                  <p className="text-[10px] text-slate-400">Courses</p>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-md">
                  <p className="font-bold text-slate-800">{comp._count?.assessments || 0}</p>
                  <p className="text-[10px] text-slate-400">Assessments</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingComp ? 'Edit Competency' : 'Add New Competency'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Competency Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SQL Database Optimization"
                  {...register('name', { required: 'Competency name is required' })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    list="category-suggestions"
                    placeholder="e.g. Technical"
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <datalist id="category-suggestions">
                    <option value="Technical" />
                    <option value="Soft Skills" />
                    <option value="Leadership" />
                    <option value="Domain Knowledge" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Level Scale *
                  </label>
                  <select
                    {...register('maxLevel')}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={4}>4 Levels (Default)</option>
                    <option value={5}>5 Levels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain what proficiency in this competency entails..."
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
                  {isSubmitting ? 'Saving...' : editingComp ? 'Save Changes' : 'Create Competency'}
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
        title="Delete Competency"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? It must not be attached to any active organizational roles.`}
        confirmText="Delete Competency"
        isLoading={isDeleting}
      />
    </div>
  );
}
