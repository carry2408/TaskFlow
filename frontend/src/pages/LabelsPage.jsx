import { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus } from 'lucide-react';
import { labelsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { Button, Input, Modal, EmptyState, Skeleton } from '../components/ui';

export function LabelsPage() {
  const { addToast } = useToast();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    loadLabels();
  }, []);

  async function loadLabels() {
    setLoading(true);
    try {
      const res = await labelsApi.getAll();
      if (res?.data) {
        setLabels(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load labels', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await labelsApi.create({
        name: formData.name.trim(),
        color: formData.color,
      });
      addToast('Label created successfully', 'success');
      setCreateModalOpen(false);
      setFormData({ name: '', color: '#3b82f6' });
      loadLabels();
    } catch (err) {
      addToast(err.message || 'Failed to create label', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Labels</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage tags for cross-project classification</p>
        </div>

        <Button size="sm" onClick={() => setCreateModalOpen(true)} className="flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Create Label
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : labels.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="No labels found"
          description="Labels help categorize and organize bugs, features, and stories."
          action={
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              Create First Label
            </Button>
          }
        />
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Label Name</th>
                <th className="py-2.5 px-4">Color Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {labels.map((label) => (
                <tr key={label.id} className="hover:bg-surface-hover transition-colors">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-surface border border-surface-border text-gray-200">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: label.color || '#3b82f6' }}
                      />
                      {label.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-gray-400">
                    {label.color || '#3b82f6'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Label"
      >
        <form onSubmit={handleCreateLabel} className="space-y-4">
          <Input
            label="Label Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="frontend, security, tech-debt"
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-300">Badge Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-10 h-8 rounded border border-surface-border bg-surface cursor-pointer p-0.5"
              />
              <span className="text-xs font-mono text-gray-400">{formData.color}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Label</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

