import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, CheckSquare } from 'lucide-react';
import { issuesApi, projectsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { StatusBadge, PriorityIndicator, TypeBadge, Avatar, Button, Select, EmptyState, Skeleton } from '../components/ui';
import { CreateIssueModal } from '../components/issues/CreateIssueModal';

export function IssuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const queryParam = searchParams.get('query') || '';
  const statusParam = searchParams.get('status') || '';
  const priorityParam = searchParams.get('priority') || '';
  const projectParam = searchParams.get('projectId') || '';

  const [searchInput, setSearchInput] = useState(queryParam);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadIssues();
  }, [searchParams]);

  async function loadProjects() {
    try {
      const res = await projectsApi.getAll({ size: 100 });
      if (res?.data?.content) setProjects(res.data.content);
    } catch {
      // silent
    }
  }

  async function loadIssues() {
    setLoading(true);
    try {
      const params = {
        size: 50,
        sortDir: 'desc',
        sortBy: 'updatedAt',
      };
      if (queryParam) params.query = queryParam;
      if (statusParam) params.status = statusParam;
      if (priorityParam) params.priority = priorityParam;
      if (projectParam) params.projectId = Number(projectParam);

      const res = await issuesApi.search(params);
      if (res?.data?.content) {
        setIssues(res.data.content);
      } else {
        setIssues([]);
      }
    } catch (err) {
      addToast(err.message || 'Failed to search issues', 'error');
    } finally {
      setLoading(false);
    }
  }

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('query', searchInput.trim());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Issues & Tasks</h1>
          <p className="text-xs text-gray-400 mt-0.5">Filter, inspect, and track work items across projects</p>
        </div>
        <Button size="sm" onClick={() => setCreateModalOpen(true)} className="flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Create Issue
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-surface-card p-3 rounded-md border border-surface-border">
        <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 md:col-span-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title/desc..."
            className="w-full bg-surface border border-surface-border rounded pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
        </form>

        <Select
          value={projectParam}
          onChange={(e) => updateFilter('projectId', e.target.value)}
          className="text-xs"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.projectKey})
            </option>
          ))}
        </Select>

        <Select
          value={statusParam}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="text-xs"
        >
          <option value="">All Statuses</option>
          <option value="TO_DO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
          <option value="BLOCKED">Blocked</option>
        </Select>

        <Select
          value={priorityParam}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="text-xs"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No issues found"
          description="Try clearing search filters or create a new issue for this project."
          action={
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              Create First Issue
            </Button>
          }
        />
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Key</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Title</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Assignee</th>
                <th className="py-2.5 px-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-surface-hover transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-gray-400 font-medium whitespace-nowrap">
                    {issue.projectKey}-{issue.id}
                  </td>
                  <td className="py-2.5 px-4">
                    <TypeBadge type={issue.issueType} />
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
                  <td className="py-2.5 px-4 text-gray-400">
                    {issue.dueDate || <span className="text-gray-600">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateIssueModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onIssueCreated={() => {
          setCreateModalOpen(false);
          loadIssues();
        }}
      />
    </div>
  );
}

