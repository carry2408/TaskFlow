import { useState, useEffect } from 'react';
import { Plus, Zap, CheckCircle2, Play, CheckSquare } from 'lucide-react';
import { sprintsApi, projectsApi, issuesApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input, Select, Modal, EmptyState, Skeleton, PriorityIndicator } from '../components/ui';

export function SprintsPage() {
  const { hasRole } = useAuth();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeSprintIssues, setActiveSprintIssues] = useState([]);
  const [selectedSprintForIssues, setSelectedSprintForIssues] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadSprints(selectedProjectId);
    }
  }, [selectedProjectId]);

  async function loadProjects() {
    try {
      const res = await projectsApi.getAll({ size: 100 });
      if (res?.data?.content && res.data.content.length > 0) {
        setProjects(res.data.content);
        setSelectedProjectId(res.data.content[0].id);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  async function loadSprints(projectId) {
    setLoading(true);
    try {
      const res = await sprintsApi.getByProject(projectId);
      if (res?.data) {
        setSprints(res.data);
      } else {
        setSprints([]);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load sprints', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      addToast('Start and end dates are required', 'error');
      return;
    }

    try {
      await sprintsApi.create(selectedProjectId, formData);
      addToast('Sprint created successfully', 'success');
      setCreateModalOpen(false);
      setFormData({ name: '', goal: '', startDate: '', endDate: '' });
      loadSprints(selectedProjectId);
    } catch (err) {
      addToast(err.message || 'Failed to create sprint', 'error');
    }
  };

  const handleUpdateStatus = async (sprintId, status) => {
    try {
      await sprintsApi.updateStatus(sprintId, status);
      addToast(`Sprint marked as ${status}`, 'success');
      loadSprints(selectedProjectId);
    } catch (err) {
      addToast(err.message || 'Failed to update sprint status', 'error');
    }
  };

  const handleViewSprintIssues = async (sprint) => {
    setSelectedSprintForIssues(sprint);
    try {
      const res = await sprintsApi.getIssues(sprint.id);
      if (res?.data) setActiveSprintIssues(res.data);
    } catch {
      setActiveSprintIssues([]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-gray-400" />
          <h1 className="text-xl font-bold text-gray-100">Sprint Planning</h1>
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

        {hasRole('ADMIN') || hasRole('PROJECT_MANAGER') ? (
          <Button size="sm" onClick={() => setCreateModalOpen(true)} className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create Sprint
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : sprints.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No sprints for this project"
          description="Sprints help engineering teams scope and track iterations."
          action={
            hasRole('ADMIN') || hasRole('PROJECT_MANAGER') ? (
              <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                Start First Sprint
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="bg-surface-card border border-surface-border rounded-lg p-5 flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-gray-100">{sprint.name}</h3>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      sprint.status === 'ACTIVE'
                        ? 'bg-sky-950/70 border-sky-800 text-sky-300'
                        : sprint.status === 'CLOSED'
                        ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                        : 'bg-surface-muted border-surface-border text-gray-400'
                    }`}
                  >
                    {sprint.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewSprintIssues(sprint)}
                  >
                    View Issues
                  </Button>

                  {(hasRole('ADMIN') || hasRole('PROJECT_MANAGER')) && (
                    <>
                      {sprint.status === 'PLANNED' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(sprint.id, 'ACTIVE')}
                          className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700"
                        >
                          <Play className="w-3 h-3" /> Start Sprint
                        </Button>
                      )}
                      {sprint.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(sprint.id, 'CLOSED')}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Complete Sprint
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {sprint.goal && (
                <p className="text-xs text-gray-400 bg-surface p-2.5 rounded border border-surface-border">
                  <strong className="text-gray-300">Goal:</strong> {sprint.goal}
                </p>
              )}

              <div className="flex items-center gap-6 text-[11px] text-gray-500">
                <span>Start: {sprint.startDate}</span>
                <span>End: {sprint.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Sprint"
      >
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <Input
            label="Sprint Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Sprint 1 - Core Workflow"
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-300">Sprint Goal</label>
            <textarea
              rows={2}
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="What is the objective of this sprint?"
              className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Start Date *"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              type="date"
              label="End Date *"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Sprint</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedSprintForIssues)}
        onClose={() => setSelectedSprintForIssues(null)}
        title={`Issues in ${selectedSprintForIssues?.name || 'Sprint'}`}
      >
        <div className="space-y-3">
          {activeSprintIssues.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500">
              No issues currently in this sprint.
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {activeSprintIssues.map((issue) => (
                <div key={issue.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-gray-400 mr-2 font-medium">
                      {issue.projectKey}-{issue.id}
                    </span>
                    <span className="text-gray-200 font-medium">{issue.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityIndicator priority={issue.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

