import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { notificationsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { Button, EmptyState, Skeleton } from '../components/ui';

export function NotificationsPage() {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await notificationsApi.getAll({ size: 50 });
      if (res?.data?.content) {
        setNotifications(res.data.content);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch {
      // silent
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      addToast('All notifications marked as read', 'success');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      addToast(err.message || 'Failed to mark all as read', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Notifications</h1>
          <p className="text-xs text-gray-400 mt-0.5">Alerts, assignments, and ticket updates</p>
        </div>

        {notifications.some((n) => !n.readAt) && (
          <Button size="sm" variant="secondary" onClick={handleMarkAllAsRead} className="flex items-center gap-1.5">
            <CheckCheck className="w-3.5 h-3.5" /> Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="You don't have any notifications at the moment."
        />
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-md divide-y divide-surface-border overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                n.readAt ? 'opacity-70 bg-surface' : 'bg-surface-card hover:bg-surface-hover'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.readAt && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                  <span className="text-xs font-semibold text-gray-200">{n.title}</span>
                  <span className="text-[10px] font-mono uppercase px-1 rounded bg-surface-muted text-gray-400">
                    {n.type}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {!n.readAt && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="text-xs text-brand-400 hover:text-brand-300 whitespace-nowrap p-1 font-medium"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

