import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { dashboardApi, projectsApi, issuesApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityIndicator, Avatar, Button, Skeleton } from '../components/ui';

export function DashboardPage() {
  const { user } = useAuth();
  const { openCreateIssue } = useOutletContext() || {};
  const [summary, setSummary] = useState(null);
  const [activeProjects, setActiveProjects] = useState([]);
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, projRes, issuesRes] = await Promise.all([
          dashboardApi.getSummary(),
          projectsApi.getAll({ size: 5, sortBy: 'updatedAt', sortDir: 'desc' }),
          user?.id
            ? issuesApi.search({ assigneeId: user.id, size: 6, sortBy: 'updatedAt', sortDir: 'desc' })
            : Promise.resolve({ data: { content: [] } }),
        ]);

        if (dashRes?.data) setSummary(dashRes.data);
        if (projRes?.data?.content) setActiveProjects(projRes.data.content);
        if (issuesRes?.data?.content) setAssignedIssues(issuesRes.data.content);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Engineering Workspace</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Overview for {user?.fullName || user?.username}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/projects">
            <Button variant="secondary" size="sm">
              View All Projects
            </Button>
          </Link>
          {openCreateIssue && (
            <Button size="sm" onClick={openCreateIssue} className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Issue
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface-card border border-surface-border rounded-md p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
            <span>Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-100">{summary?.totalProjects ?? 0}</div>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-md p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
            <span>In Progress Work</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-400">{summary?.inProgressIssues ?? 0}</div>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-md p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{summary?.resolvedIssues ?? 0}</div>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-md p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
            <span>Overdue Issues</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{summary?.overdueIssues ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Assigned to Me ({assignedIssues.length})
            </h2>
            <Link to="/issues?assignee=me" className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-surface-border flex-1">
            {assignedIssues.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No issues currently assigned to you.
              </div>
            ) : (
              assignedIssues.map((issue) => (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-surface-hover transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="font-mono text-[11px] text-gray-400 font-medium">
                      {issue.projectKey}-{issue.id}
                    </span>
                    <span className="text-gray-200 truncate font-medium">{issue.title}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <PriorityIndicator priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Active Projects
            </h2>
            <Link to="/projects" className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-surface-border flex-1">
            {activeProjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No projects found. Create one to begin.
              </div>
            ) : (
              activeProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="px-4 py-3 flex items-center justify-between hover:bg-surface-hover transition-colors text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-200">{project.name}</span>
                      <span className="font-mono text-[11px] text-gray-500 bg-surface-muted px-1 rounded">
                        {project.projectKey}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-[11px] text-gray-400 truncate mt-0.5 max-w-sm">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {project.leadUser && (
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                        <span>Lead:</span>
                        <Avatar user={project.leadUser} size="xs" />
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

