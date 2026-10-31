import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderGit2 } from 'lucide-react';
import { projectsApi, teamsApi, usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input, Select, Modal, Avatar, EmptyState, Skeleton } from '../components/ui';

export function ProjectsPage() {
  const { hasRole, user } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    projectKey: '',
    description: '',
    status: 'ACTIVE',
    leadUserId: user?.id || '',
    teamId: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await projectsApi.getAll({ size: 100 });
      if (res?.data?.content) {
        setProjects(res.data.content);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function openCreateModal() {
    try {
      const [tRes, uRes] = await Promise.all([
        teamsApi.getAll({ size: 50 }).catch(() => ({ data: { content: [] } })),
        usersApi.getAll({ size: 100 }).catch(() => ({ data: { content: [] } })),
      ]);
      setTeams(tRes?.data?.content || []);
      setUsers(uRes?.data?.content || []);
      setFormData((prev) => ({
        ...prev,
        leadUserId: prev.leadUserId || user?.id || uRes?.data?.content?.[0]?.id || '',
      }));
      setCreateModalOpen(true);
    } catch {
      setCreateModalOpen(true);
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        projectKey: formData.projectKey.trim().toUpperCase() || undefined,
        description: formData.description.trim() || null,
        status: formData.status,
        leadUserId: Number(formData.leadUserId),
        teamId: formData.teamId ? Number(formData.teamId) : null,
      };

      await projectsApi.create(payload);
      addToast('Project created successfully', 'success');
      setCreateModalOpen(false);
      setFormData({
        name: '',
        projectKey: '',
        description: '',
        status: 'ACTIVE',
        leadUserId: user?.id || '',
        teamId: '',
      });
      loadProjects();
    } catch (err) {
      addToast(err.message || 'Failed to create project', 'error');
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.projectKey.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Projects</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage engineering workspaces and access</p>
        </div>
        {hasRole('ADMIN') || hasRole('PROJECT_MANAGER') ? (
          <Button size="sm" onClick={openCreateModal} className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Create Project
          </Button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter projects..."
            className="w-full bg-surface border border-surface-border rounded pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects found"
          description="Projects represent work containers for issues, roadmaps, and sprints."
          action={
            hasRole('ADMIN') || hasRole('PROJECT_MANAGER') ? (
              <Button size="sm" onClick={openCreateModal}>
                Create First Project
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Key</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Lead</th>
                <th className="py-2.5 px-4">Team</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-surface-hover transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-semibold text-gray-200 hover:text-brand-400 block"
                    >
                      {p.name}
                    </Link>
                    {p.description && (
                      <span className="text-[11px] text-gray-500 block truncate max-w-sm">
                        {p.description}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-gray-300 font-medium">
                    {p.projectKey}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-surface-muted text-gray-300 border border-surface-border">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.leadUser ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar user={p.leadUser} size="xs" />
                        <span className="text-gray-300">{p.leadUser.fullName}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {p.team?.name || <span className="text-gray-600">None</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/projects/${p.id}`}>
                      <Button variant="ghost" size="sm">
                        Open
                      </Button>
                    </Link>
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
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Platform Infrastructure"
            required
          />

          <Input
            label="Project Key (2-10 uppercase chars, optional auto-generated)"
            value={formData.projectKey}
            onChange={(e) => setFormData({ ...formData, projectKey: e.target.value.toUpperCase() })}
            placeholder="PLAT"
            maxLength={10}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-300">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Scope and purpose of this project..."
              className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Lead User *"
              value={formData.leadUserId}
              onChange={(e) => setFormData({ ...formData, leadUserId: e.target.value })}
              required
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || u.username}
                </option>
              ))}
            </Select>

            <Select
              label="Associated Team (Optional)"
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            >
              <option value="">No Team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

