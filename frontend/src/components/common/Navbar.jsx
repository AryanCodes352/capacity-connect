/**
 * src/components/common/Navbar.jsx
 *
 * FUNCTIONAL NOTE: All API calls (notifications fetch, mark-read, mark-all-read),
 * state management, event handlers, and routing are preserved exactly.
 * Only visual styling is changed.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut, ChevronDown, CheckCheck, Menu, User } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  getMyNotificationsApi,
  getUnreadCountApi,
  markAsReadApi,
  markAllAsReadApi,
} from '../../api/notification.api';

// Human-readable route labels for breadcrumb display
const routeLabels = {
  '/dashboard': 'Dashboard',
  '/my-competencies': 'My Competencies',
  '/my-profile': 'My Profile',
  '/skill-gaps': 'Skill Gaps',
  '/recommendations': 'Recommendations',
  '/courses': 'Explore Courses',
  '/my-learning': 'My Learning',
  '/assessments': 'Assessments',
  '/knowledge-hub': 'Knowledge Hub',
  '/notifications': 'Notifications',
  '/admin/dashboard': 'Dashboard',
  '/admin/employees': 'Employees',
  '/admin/departments': 'Departments',
  '/admin/roles': 'Org Roles',
  '/admin/competencies': 'Competencies',
  '/admin/courses': 'Courses & LMS',
  '/admin/assessments': 'Assessments',
  '/admin/training': 'Training Assignments',
  '/admin/analytics': 'Analytics',
  '/admin/knowledge': 'Knowledge Hub',
  '/trainer/dashboard': 'Dashboard',
  '/trainer/courses': 'My Courses',
  '/trainer/assessments': 'Assessments',
  '/trainer/learners': 'Learner Analytics',
};

const getRoleBadge = (role) => {
  switch (role) {
    case 'ADMIN':   return 'bg-purple-100 text-purple-700 ring-1 ring-purple-200';
    case 'TRAINER': return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
    default:        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
  }
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

export default function Navbar({ title = 'Capacity Connect', onMenuClick }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const navigate  = useNavigate();
  const location  = useLocation();

  // Derive breadcrumb label from current path
  const pageLabel = routeLabels[location.pathname] || title;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchNotifs = async () => {
    try {
      const [list, countData] = await Promise.all([
        getMyNotificationsApi(),
        getUnreadCountApi(),
      ]);
      setNotifications(list.slice(0, 5));
      setUnreadCount(countData.unreadCount || 0);
    } catch {
      // Silently ignore if offline
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id, link) => {
    try {
      await markAsReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (link) {
        setNotifOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Menu + Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-slate-800 truncate leading-none">
            {pageLabel}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block leading-none">
            Capacity Connect
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Role badge */}
        {user?.role && (
          <span className={`hidden sm:inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
          </span>
        )}

        {/* ── Notification Bell ── */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setDropdownOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in"
              onMouseLeave={() => setNotifOpen(false)}
            >
              {/* Popover header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.link)}
                      className={`px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !n.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-slate-200'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-xs text-slate-400 mt-1 block">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── User Profile Dropdown ── */}
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-slate-800 leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 leading-none truncate max-w-[110px]">
                {user?.jobTitle || user?.email}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 hidden md:block transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate leading-none">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Profile link — only for employees */}
              {user?.role === 'EMPLOYEE' && (
                <Link
                  to="/my-competencies"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
              )}

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
