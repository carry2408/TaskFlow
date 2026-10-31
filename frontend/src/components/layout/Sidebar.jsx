import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  Kanban,
  Zap,
  Users,
  UserCheck,
  Bell,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { hasRole } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/issues', label: 'Issues', icon: CheckSquare },
    { to: '/board', label: 'Kanban Board', icon: Kanban },
    { to: '/sprints', label: 'Sprints', icon: Zap },
    { to: '/teams', label: 'Teams', icon: Users },
    { to: '/labels', label: 'Labels', icon: Tag },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  if (hasRole('ADMIN')) {
    navItems.push({ to: '/users', label: 'User Directory', icon: UserCheck });
  }

  return (
    <aside
      className={`h-screen bg-[#090d12] border-r border-surface-border flex flex-col transition-all duration-200 select-none flex-shrink-0 z-20 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="h-14 px-4 flex items-center justify-between border-b border-surface-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
              TF
            </div>
            <span className="font-semibold text-sm tracking-tight text-gray-100 truncate">
              TaskFlow
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center font-bold text-xs text-white mx-auto">
            TF
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-surface-hover ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-500 font-semibold border-l-2 border-brand-500 rounded-l-none'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-surface-border">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex justify-center p-2 rounded text-gray-400 hover:text-gray-200 hover:bg-surface-hover"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="px-3 py-2 text-[11px] text-gray-500 flex items-center justify-between">
            <span>TaskFlow v1.0</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected to Backend" />
          </div>
        )}
      </div>
    </aside>
  );
}

