import { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Avatar, EmptyState, Skeleton } from '../components/ui';

export function UsersPage() {
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasRole('ADMIN')) {
      loadUsers();
    }
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ size: 100 });
      if (res?.data?.content) {
        setUsers(res.data.content);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load user directory', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!hasRole('ADMIN')) {
    return (
      <div className="p-12 text-center text-sm text-gray-400">
        Access Denied. Only administrators can view the user directory.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-xl font-bold text-gray-100">User Directory</h1>
        <p className="text-xs text-gray-400 mt-0.5">Global system users and assigned roles (Admin only)</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={UserCheck} title="No users found" />
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Username</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Roles</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar user={u} size="sm" />
                      <span className="font-semibold text-gray-200">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-gray-400">{u.username}</td>
                  <td className="py-3 px-4 text-gray-300">{u.email}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles?.map((r) => (
                        <span
                          key={r}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-muted text-gray-300 border border-surface-border"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        u.enabled
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/60 border-rose-800 text-rose-300'
                      }`}
                    >
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

