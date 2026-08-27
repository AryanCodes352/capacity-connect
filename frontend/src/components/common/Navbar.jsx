/**
 * src/components/common/Navbar.jsx
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut, ChevronDown, CheckCheck, Menu } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getMyNotificationsApi,
  getUnreadCountApi,
  markAsReadApi,
  markAllAsReadApi,
} from '../../api/notification.api';

export default function Navbar({ title = 'Capacity Connect', onMenuClick }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

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
    } catch (err) {
      // Silently ignore if offline
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000); // 30s poll
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'TRAINER': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger menu — only on mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 tracking-tight truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Role Badge — hidden on very small screens */}
        {user?.role && (
          <span className={`hidden sm:inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
            {user.role}
          </span>
        )}

        {/* ── Notification Bell with Popover ── */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setDropdownOpen(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setNotifOpen(false)}
            >
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                  <p className="text-[11px] text-slate-400">
                    {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.link)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !n.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-blue-600' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View All Notifications
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
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-none truncate max-w-[120px]">
                {user?.jobTitle || user?.email}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
