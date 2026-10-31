import { useState, useEffect } from 'react';
import { usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input, Button, Avatar } from '../components/ui';

export function ProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    avatarUrl: '',
    newPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await usersApi.getMe();
      if (res?.data) {
        setProfile(res.data);
        setFormData({
          fullName: res.data.fullName || '',
          avatarUrl: res.data.avatarUrl || '',
          newPassword: '',
        });
      }
    } catch (err) {
      addToast(err.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        avatarUrl: formData.avatarUrl.trim() || null,
        newPassword: formData.newPassword.trim() || null,
      };

      const res = await usersApi.updateMe(payload);
      if (res?.data) {
        setProfile(res.data);
        localStorage.setItem('taskflow_user', JSON.stringify(res.data));
      }
      setFormData((prev) => ({ ...prev, newPassword: '' }));
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-xl font-bold text-gray-100">Profile Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage your personal account credentials</p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar user={profile || user} size="lg" />
          <div>
            <h3 className="text-sm font-bold text-gray-100">{profile?.fullName}</h3>
            <p className="text-xs text-gray-400">@{profile?.username} · {profile?.email}</p>
            <div className="flex gap-1.5 mt-2">
              {profile?.roles?.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-muted text-gray-300 border border-surface-border"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-surface-border">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Input
            label="Avatar Image URL (Optional)"
            value={formData.avatarUrl}
            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            placeholder="https://..."
          />

          <Input
            type="password"
            label="New Password (leave empty to keep current)"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="Min. 8 characters"
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

