/**
 * src/pages/admin/TrainingAssignments.jsx — Admin Training Assignment & Deadline Tracker
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  GraduationCap,
  Plus,
  Search,
  Calendar,
  Users,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllTrainingAssignmentsApi,
  assignTrainingApi,
  updateAssignmentStatusApi,
} from '../../api/training.api';
import { getCoursesApi } from '../../api/course.api';
import { getUsersApi } from '../../api/user.api';
import { getDepartmentsApi } from '../../api/department.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function TrainingAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState('SINGLE'); // SINGLE | DEPARTMENT

  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assignmentsData, coursesData, usersData, deptsData] = await Promise.all([
        getAllTrainingAssignmentsApi({
          status: statusFilter || undefined,
          departmentId: deptFilter || undefined,
          search: search || undefined,
        }),
        getCoursesApi({ status: 'PUBLISHED' }),
        getUsersApi({ role: 'EMPLOYEE', limit: 100 }),
        getDepartmentsApi(),
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
      setUsers(usersData.data || []);
      setDepartments(deptsData);
    } catch (err) {
      toast.error('Failed to load training assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, deptFilter, search]);

  const openCreateModal = () => {
    reset({
      courseId: '',
      userId: '',
      departmentId: '',
      deadline: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        courseId: data.courseId,
        deadline: data.deadline || null,
        notes: data.notes || null,
        ...(assignmentMode === 'SINGLE' ? { userId: data.userId } : { departmentId: data.departmentId }),
      };

      const res = await assignTrainingApi(payload);
      toast.success(`Training assigned to ${res.totalAssigned} employee(s)`);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign training');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAssignmentStatusApi(id, newStatus);
      toast.success('Assignment status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status, isOverdue) => {
    if (isOverdue || status === 'OVERDUE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          OVERDUE
        </span>
      );
    }

    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            IN PROGRESS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            ASSIGNED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Training Assignments & Governance</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Assign capacity programs to individuals or departments and track completion deadlines
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Assign Training
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee or course..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="OVERDUE">Overdue</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Assignments Table */}
      {isLoading ? (
        <LoadingSpinner text="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No training assignments found"
          description="Create your first training assignment to mandate capacity building."
          icon={GraduationCap}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-4 py-3.5">Department / Role</th>
                  <th className="px-4 py-3.5">Assigned Course</th>
                  <th className="px-4 py-3.5">Deadline</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">
                        {a.user?.firstName} {a.user?.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400">{a.user?.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <p className="font-medium">{a.user?.department?.name || 'Unassigned'}</p>
                      <p className="text-[11px] text-slate-400">{a.user?.orgRole?.name || 'No Role'}</p>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {a.course?.title}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {a.deadline ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(a.deadline).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No Deadline</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(a.status, a.isOverdue)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        className="px-2 py-1 text-[11px] font-semibold rounded-md border border-slate-200 bg-white"
                      >
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Training Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Assign Training Program
            </h3>

            {/* Target Type Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAssignmentMode('SINGLE')}
                className={`py-1.5 rounded-lg transition-colors ${
                  assignmentMode === 'SINGLE' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Individual Employee
              </button>
              <button
                type="button"
                onClick={() => setAssignmentMode('DEPARTMENT')}
                className={`py-1.5 rounded-lg transition-colors ${
                  assignmentMode === 'DEPARTMENT' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Entire Department
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Course *
                </label>
                <select
                  {...register('courseId', { required: 'Please select a course' })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.difficulty})
                    </option>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.courseId.message}</p>
                )}
              </div>

              {assignmentMode === 'SINGLE' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Employee *
                  </label>
                  <select
                    {...register('userId', { required: 'Please select an employee' })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Employee</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                  {errors.userId && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.userId.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Department *
                  </label>
                  <select
                    {...register('departmentId', { required: 'Please select a department' })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.departmentId.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Completion Deadline
                </label>
                <input
                  type="date"
                  {...register('deadline')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Priority training to address identified SQL capability gap."
                  {...register('notes')}
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
                  {isSubmitting ? 'Assigning...' : 'Assign Training'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
