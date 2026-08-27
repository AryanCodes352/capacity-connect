/**
 * src/pages/employee/Notifications.jsx — Full Notification Center
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMyNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
} from '../../api/notification.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setIsLoading(true);
      const data = await getMyNotificationsApi();
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'TRAINING_ASSIGNED': return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'DEADLINE_APPROACHING': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'COMPETENCY_UPGRADED':
      case 'ASSESSMENT_GRADED': return <Award className="w-5 h-5 text-emerald-600" />;
      case 'RECOMMENDATION_NEW': return <BookOpen className="w-5 h-5 text-purple-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Notification Center</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time updates regarding training assignments, assessment evaluations, and competency advancements
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <LoadingSpinner text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="You have no notifications or alerts at this time."
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'border-blue-200 bg-blue-50/30 ring-1 ring-blue-500/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0">
                  {getNotifIcon(n.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm ${!n.isRead ? 'font-extrabold text-slate-900' : 'font-bold text-slate-800'}`}>
                      {n.title}
                    </h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {n.message}
                  </p>

                  <span className="text-[10px] text-slate-400 font-medium block pt-1">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {n.link && (
                <Link
                  to={n.link}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shrink-0 shadow-xs"
                >
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
