import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Kanban as KanbanIcon } from 'lucide-react';
import { projectsApi, issuesApi } from '../api';
import { useToast } from '../context/ToastContext';
import { PriorityIndicator, TypeBadge, Avatar, Button, Select, Skeleton } from '../components/ui';
import { CreateIssueModal } from '../components/issues/CreateIssueModal';

const COLUMNS = [
  { id: 'TO_DO', title: 'To Do', color: 'border-slate-700 bg-slate-900/40' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-sky-900 bg-sky-950/20' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'border-amber-900 bg-amber-950/20' },
  { id: 'DONE', title: 'Done', color: 'border-emerald-900 bg-emerald-950/20' },
  { id: 'BLOCKED', title: 'Blocked', color: 'border-rose-900 bg-rose-950/20' },
];

export function KanbanBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project') || '');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadBoardIssues(selectedProjectId);
      setSearchParams({ project: selectedProjectId });
    }
  }, [selectedProjectId]);

  async function loadProjects() {
    try {
      const res = await projectsApi.getAll({ size: 100 });
      if (res?.data?.content && res.data.content.length > 0) {
        setProjects(res.data.content);
        if (!selectedProjectId) {
          setSelectedProjectId(res.data.content[0].id);
        }
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  async function loadBoardIssues(projectId) {
    setLoading(true);
    try {
      const res = await issuesApi.getByProject(projectId, { size: 100 });
      if (res?.data?.content) {
        setIssues(res.data.content);
      } else {
        setIssues([]);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load board issues', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await issuesApi.transitionStatus(issueId, newStatus);
      addToast('Issue moved', 'success');
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
      );
    } catch (err) {
      addToast(err.message || 'Failed to move issue', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <KanbanIcon className="w-5 h-5 text-gray-400" />
          <h1 className="text-xl font-bold text-gray-100">Kanban Board</h1>
          <div className="w-48">
            <Select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs py-1"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.projectKey})
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Button size="sm" onClick={() => setCreateModalOpen(true)} className="flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Issue
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-400">
          Please create a project first before viewing the Kanban board.
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3 min-h-[500px] overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colIssues = issues.filter((i) => i.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-surface-card border border-surface-border rounded-lg flex flex-col min-w-[240px] max-h-full overflow-hidden"
              >
                <div className="px-3 py-2.5 border-b border-surface-border flex items-center justify-between bg-surface">
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {col.title}
                  </span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-muted text-gray-400 border border-surface-border">
                    {colIssues.length}
                  </span>
                </div>

                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {colIssues.length === 0 ? (
                    <div className="h-24 border border-dashed border-surface-border rounded flex items-center justify-center text-[11px] text-gray-600">
                      Empty
                    </div>
                  ) : (
                    colIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="bg-surface border border-surface-border hover:border-gray-600 rounded p-3 transition-colors shadow-sm flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-gray-400 font-medium">
                            {issue.projectKey}-{issue.id}
                          </span>
                          <TypeBadge type={issue.issueType} />
                        </div>

                        <Link
                          to={`/issues/${issue.id}`}
                          className="text-xs font-medium text-gray-200 hover:text-brand-400 line-clamp-2"
                        >
                          {issue.title}
                        </Link>

                        <div className="flex items-center justify-between pt-1 border-t border-surface-border/60">
                          <PriorityIndicator priority={issue.priority} />

                          <div className="flex items-center gap-1.5">
                            <select
                              value={issue.status}
                              onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                              className="text-[10px] bg-surface-card border border-surface-border rounded px-1 py-0.5 text-gray-300 focus:outline-none"
                            >
                              <option value="TO_DO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="IN_REVIEW">In Review</option>
                              <option value="DONE">Done</option>
                              <option value="BLOCKED">Blocked</option>
                            </select>
                            <Avatar user={issue.assignee} size="xs" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateIssueModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultProjectId={selectedProjectId}
        onIssueCreated={() => {
          setCreateModalOpen(false);
          loadBoardIssues(selectedProjectId);
        }}
      />
    </div>
  );
}

