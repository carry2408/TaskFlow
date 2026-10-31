import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Users, CheckSquare, Zap, ArrowLeft, UserPlus } from 'lucide-react';
import { projectsApi, issuesApi, sprintsApi, usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, PriorityIndicator, Avatar, Button, Modal, Select, Skeleton } from '../components/ui';
import { CreateIssueModal } from '../components/issues/CreateIssueModal';

export function ProjectDetailPage() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const { addToast } = useToast();
  const canManageProjects = hasRole('ADMIN') || hasRole('PROJECT_MANAGER');

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [activeTab, setActiveTab] = useState('issues');
  const [loading, setLoading] = useState(true);

  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('DEVELOPER');

  useEffect(() => {
    loadProjectData();
  }, [id]);

  async function loadProjectData() {
    setLoading(true);
    try {
      const [projRes, issuesRes, sprintsRes] = await Promise.all([
        projectsApi.getById(id),
        issuesApi.getByProject(id, { size: 50, sortDir: 'desc' }),
        sprintsApi.getByProject(id).catch(() => ({ data: [] })),
      ]);

      if (projRes?.data) setProject(projRes.data);
      if (issuesRes?.data?.content) setIssues(issuesRes.data.content);
      if (sprintsRes?.data) setSprints(sprintsRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function openAddMemberModal() {
    try {
      const res = await usersApi.getAll({ size: 100 });
      if (res?.data?.content) {
        setAllUsers(res.data.content);
        setSelectedUserId(res.data.content[0]?.id || '');
      }
      setAddMemberModalOpen(true);
    } catch {
      setAddMemberModalOpen(true);
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await projectsApi.addMember(id, selectedUserId, selectedRole);
      addToast('Member added to project', 'success');
      setAddMemberModalOpen(false);
      loadProjectData();
    } catch (err) {
      addToast(err.message || 'Failed to add member', 'error');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from project?')) return;
    try {
      await projectsApi.removeMember(id, userId);
      addToast('Member removed', 'success');
      loadProjectData();
    } catch (err) {
      addToast(err.message || 'Failed to remove member', 'error');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await projectsApi.updateStatus(id, newStatus);
      setProject((prev) => ({ ...prev, status: newStatus }));
      addToast('Project status updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update project status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center p-12 text-sm text-gray-400">Project not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-100">{project.name}</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-muted border border-surface-border text-gray-300 font-semibold">
                {project.projectKey}
              </span>
              {canManageProjects ? (
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded bg-surface-card border cursor-pointer focus:outline-none focus:border-brand-500 transition-colors ${
                    project.status === 'ACTIVE'
                      ? 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40'
                      : project.status === 'DRAFT'
                      ? 'text-amber-300 border-amber-800/60 bg-amber-950/40'
                      : 'text-gray-400 border-surface-border bg-surface-muted'
                  }`}
                  title="Change project status"
                >
                  <option value="ACTIVE" className="bg-surface text-gray-200">ACTIVE</option>
                  <option value="DRAFT" className="bg-surface text-gray-200">DRAFT</option>
                  <option value="ARCHIVED" className="bg-surface text-gray-200">ARCHIVED</option>
                </select>
              ) : (
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                    project.status === 'ACTIVE'
                      ? 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40'
                      : project.status === 'DRAFT'
                      ? 'text-amber-300 border-amber-800/60 bg-amber-950/40'
                      : 'text-gray-400 border-surface-border bg-surface-muted'
                  }`}
                >
                  {project.status}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-xs text-gray-400 mt-1 max-w-2xl">{project.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/board?project=${project.id}`}>
              <Button variant="secondary" size="sm">
                Open Board
              </Button>
            </Link>
            <Button size="sm" onClick={() => setCreateIssueOpen(true)} className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Issue
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-surface-border text-xs">
        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-2.5 font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'issues'
              ? 'border-brand-500 text-brand-400 font-semibold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Issues ({issues.length})
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-2.5 font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'members'
              ? 'border-brand-500 text-brand-400 font-semibold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Members ({project.members?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('sprints')}
          className={`pb-2.5 font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'sprints'
              ? 'border-brand-500 text-brand-400 font-semibold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> Sprints ({sprints.length})
        </button>
      </div>

      {activeTab === 'issues' && (
        <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden">
          {issues.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No issues created in this project yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Key</th>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Assignee</th>
                  <th className="py-2.5 px-4 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-gray-400 font-medium whitespace-nowrap">
                      {project.projectKey}-{issue.id}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-gray-200">
                      <Link to={`/issues/${issue.id}`} className="hover:text-brand-400 block truncate max-w-md">
                        {issue.title}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="py-2.5 px-4">
                      <PriorityIndicator priority={issue.priority} />
                    </td>
                    <td className="py-2.5 px-4">
                      {issue.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar user={issue.assignee} size="xs" />
                          <span className="text-gray-300">{issue.assignee.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-500">
                      {issue.updatedAt ? new Date(issue.updatedAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {hasRole('ADMIN') || hasRole('PROJECT_MANAGER') ? (
              <Button size="sm" onClick={openAddMemberModal} className="flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> Add Member
              </Button>
            ) : null}
          </div>

          <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Role in Project</th>
                  <th className="py-2.5 px-4">Joined</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {project.members?.map((m) => (
                  <tr key={m.user.id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar user={m.user} size="sm" />
                        <span className="font-medium text-gray-200">{m.user.fullName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-gray-400">{m.user.email}</td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-gray-300">{m.roleInProject}</td>
                    <td className="py-2.5 px-4 text-gray-500">
                      {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {m.user.id !== project.leadUser?.id && (hasRole('ADMIN') || hasRole('PROJECT_MANAGER')) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(m.user.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sprints' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link to="/sprints">
              <Button size="sm" variant="secondary">
                Manage Sprints
              </Button>
            </Link>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden">
            {sprints.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">No sprints created for this project.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-surface-border bg-surface text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4">Sprint Name</th>
                    <th className="py-2.5 px-4">Goal</th>
                    <th className="py-2.5 px-4">Dates</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {sprints.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-hover transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-gray-200">{s.name}</td>
                      <td className="py-2.5 px-4 text-gray-400 max-w-sm truncate">{s.goal || '-'}</td>
                      <td className="py-2.5 px-4 text-gray-400">
                        {s.startDate} to {s.endDate}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-surface-muted text-gray-300 border border-surface-border">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <CreateIssueModal
        isOpen={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        defaultProjectId={project.id}
        onIssueCreated={() => {
          setCreateIssueOpen(false);
          loadProjectData();
        }}
      />

      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        title="Add Project Member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Select
            label="User *"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName || u.username} ({u.email})
              </option>
            ))}
          </Select>

          <Select
            label="Role in Project *"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="DEVELOPER">Developer</option>
            <option value="QA">QA Engineer</option>
            <option value="MANAGER">Manager</option>
            <option value="VIEWER">Viewer</option>
          </Select>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <Button type="button" variant="secondary" onClick={() => setAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

