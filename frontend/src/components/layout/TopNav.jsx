import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../api';
import { Avatar, Button } from '../ui';

export function TopNav({ onOpenCreateIssue }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await notificationsApi.getUnreadCount();
        if (res?.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch {
        // silent fail
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/issues?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/projects')) return 'Projects';
    if (path.startsWith('/issues')) return 'Issues';
    if (path.startsWith('/board')) return 'Kanban Board';
    if (path.startsWith('/sprints')) return 'Sprints';
    if (path.startsWith('/teams')) return 'Teams';
    if (path.startsWith('/labels')) return 'Labels';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/users')) return 'User Directory';
    if (path.startsWith('/profile')) return 'Profile';
    return '';
  };

  return (
    <header className="h-14 border-b border-surface-border bg-surface px-6 flex items-center justify-between gap-4 z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-400">Workspace</span>
        <span className="text-gray-600">/</span>
        <span className="text-xs font-medium text-gray-200">{getBreadcrumb()}</span>
      </div>

      <div className="flex-1 max-w-md mx-auto hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues, projects, keys... (Enter to search)"
            className="w-full bg-[#0d1117] border border-surface-border rounded-md pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </form>
      </div>

      <div className="flex items-center gap-3">
        {onOpenCreateIssue && (
          <Button size="sm" onClick={onOpenCreateIssue} className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Issue</span>
          </Button>
        )}

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-1.5 text-gray-400 hover:text-gray-200 hover:bg-surface-hover rounded transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded hover:bg-surface-hover transition-colors focus:outline-none"
          >
            <Avatar user={user} size="sm" />
            <span className="text-xs font-medium text-gray-300 hidden sm:inline max-w-[120px] truncate">
              {user?.fullName || user?.username}
            </span>
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-surface-card border border-surface-border rounded-md shadow-xl py-1 z-30"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-surface-border">
                <p className="text-xs font-semibold text-gray-200 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-surface-hover flex items-center gap-2"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Profile Settings
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-surface-hover flex items-center gap-2"
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

