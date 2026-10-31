import { useState, useEffect } from 'react';
import { projectsApi, issuesApi, usersApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Modal, Input, Select, Button } from '../ui';

export function CreateIssueModal({ isOpen, onClose, defaultProjectId, onIssueCreated }) {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    projectId: defaultProjectId || '',
    title: '',
    description: '',
    issueType: 'TASK',
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultProjectId) {
      setFormData((prev) => ({ ...prev, projectId: defaultProjectId }));
    }
  }, [defaultProjectId]);

  async function loadOptions() {
    try {
      const [projRes, usersRes] = await Promise.all([
        projectsApi.getAll({ size: 100 }),
        usersApi.getAll({ size: 100 }).catch(() => ({ data: { content: [] } })),
      ]);

      if (projRes?.data?.content) {
        setProjects(projRes.data.content);
        if (!formData.projectId && projRes.data.content.length > 0) {
          setFormData((prev) => ({ ...prev, projectId: projRes.data.content[0].id }));
        }
      }

      if (usersRes?.data?.content) {
        setUsers(usersRes.data.content);
      }
    } catch {
      // silent
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId) {
      addToast('Please select a project', 'error');
      return;
    }
    if (!formData.title.trim()) {
      addToast('Title is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        issueType: formData.issueType,
        priority: formData.priority,
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        dueDate: formData.dueDate || null,
      };

      await issuesApi.create(formData.projectId, payload);
      addToast('Issue created successfully', 'success');
      setFormData({
        projectId: defaultProjectId || (projects[0]?.id || ''),
        title: '',
        description: '',
        issueType: 'TASK',
        priority: 'MEDIUM',
        assigneeId: '',
        dueDate: '',
      });
      if (onIssueCreated) onIssueCreated();
    } catch (err) {
      addToast(err.message || 'Failed to create issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Issue">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Project *"
          value={formData.projectId}
          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.projectKey})
            </option>
          ))}
        </Select>

        <Input
          label="Title *"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add structured details, reproduction steps, or context..."
            className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Issue Type"
            value={formData.issueType}
            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
          >
            <option value="TASK">Task</option>
            <option value="STORY">Story</option>
            <option value="BUG">Bug</option>
            <option value="EPIC">Epic</option>
            <option value="SUB_TASK">Sub-task</option>
          </Select>

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Assignee"
            value={formData.assigneeId}
            onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName || u.username}
              </option>
            ))}
          </Select>

          <Input
            type="date"
            label="Due Date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Issue'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

