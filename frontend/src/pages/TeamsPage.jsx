import { useState, useEffect } from 'react';
import { Plus, Users, UserPlus, Trash2 } from 'lucide-react';
import { teamsApi, usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input, Select, Modal, Avatar, EmptyState, Skeleton } from '../components/ui';

export function TeamsPage() {
  const { hasRole, user } = useAuth();
  const { addToast } = useToast();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leadUserId: user?.id || '',
  });

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    setLoading(true);
    try {
      const res = await teamsApi.getAll({ size: 50 });
      if (res?.data?.content) {
        setTeams(res.data.content);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load teams', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function openCreateModal() {
    try {
      const uRes = await usersApi.getAll({ size: 100 });
      if (uRes?.data?.content) {
        setAllUsers(uRes.data.content);
        setFormData((prev) => ({
          ...prev,
          leadUserId: prev.leadUserId || uRes.data.content[0]?.id || '',
        }));
      }
      setCreateModalOpen(true);
    } catch {
      setCreateModalOpen(true);
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await teamsApi.create({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        leadUserId: Number(formData.leadUserId),
      });
      addToast('Team created successfully', 'success');
      setCreateModalOpen(false);
      setFormData({ name: '', description: '', leadUserId: user?.id || '' });
      loadTeams();
    } catch (err) {
      addToast(err.message || 'Failed to create team', 'error');
    }
  };

  const openAddMember = async (team) => {
    setActiveTeam(team);
    try {
      const uRes = await usersApi.getAll({ size: 100 });
      if (uRes?.data?.content) {
        setAllUsers(uRes.data.content);
        setSelectedUserId(uRes.data.content[0]?.id || '');
      }
      setAddMemberModalOpen(true);
    } catch {
      setAddMemberModalOpen(true);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !activeTeam) return;
    try {
      await teamsApi.addMember(activeTeam.id, selectedUserId);
      addToast('Member added to team', 'success');
      setAddMemberModalOpen(false);
      loadTeams();
    } catch (err) {
      addToast(err.message || 'Failed to add member', 'error');
    }
  };

  const handleRemoveMember = async (teamId, memberUserId) => {
    if (!window.confirm('Remove this member from team?')) return;
    try {
      await teamsApi.removeMember(teamId, memberUserId);
      addToast('Member removed', 'success');
      loadTeams();
    } catch (err) {
      addToast(err.message || 'Failed to remove member', 'error');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await teamsApi.delete(teamId);
      addToast('Team deleted', 'success');
      loadTeams();
    } catch (err) {
      addToast(err.message || 'Failed to delete team', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Teams</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage engineering groups and departmental access</p>
        </div>

        {hasRole('ADMIN') || hasRole('PROJECT_MANAGER') ? (
          <Button size="sm" onClick={openCreateModal} className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create Team
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams established"
          description="Group engineers and managers into teams to assign across projects."
          action={
            hasRole('ADMIN') || hasRole('PROJECT_MANAGER') ? (
              <Button size="sm" onClick={openCreateModal}>
                Create Team
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-surface-card border border-surface-border rounded-lg p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-bold text-gray-100">{team.name}</h3>
                  {hasRole('ADMIN') && (
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-gray-500 hover:text-red-400 p-1"
                      title="Delete team"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {team.description && (
                  <p className="text-xs text-gray-400 mb-3">{team.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Lead:</span>
                  <Avatar user={team.leadUser} size="xs" />
                  <span className="text-gray-200 font-medium">{team.leadUser?.fullName}</span>
                </div>
              </div>

              <div className="border-t border-surface-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Members ({team.members?.length || 0})
                  </span>
                  {(hasRole('ADMIN') || hasRole('PROJECT_MANAGER')) && (
                    <button
                      onClick={() => openAddMember(team)}
                      className="text-[11px] text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" /> Add Member
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {team.members?.length === 0 ? (
                    <span className="text-xs text-gray-500">No members yet.</span>
                  ) : (
                    team.members?.map((m) => (
                      <div
                        key={m.id}
                        className="bg-surface border border-surface-border rounded px-2 py-1 text-xs text-gray-300 flex items-center gap-1.5"
                      >
                        <Avatar user={m} size="xs" />
                        <span>{m.fullName}</span>
                        {m.id !== team.leadUser?.id && (hasRole('ADMIN') || hasRole('PROJECT_MANAGER')) && (
                          <button
                            onClick={() => handleRemoveMember(team.id, m.id)}
                            className="text-gray-500 hover:text-red-400 ml-1"
                            title="Remove"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Team"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <Input
            label="Team Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Frontend Core Team"
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-300">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Responsibilities of this team..."
              className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <Select
            label="Team Lead *"
            value={formData.leadUserId}
            onChange={(e) => setFormData({ ...formData, leadUserId: e.target.value })}
            required
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName || u.username} ({u.email})
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Team</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        title={`Add Member to ${activeTeam?.name || 'Team'}`}
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Select
            label="Select User *"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
          >
            {allUsers
              .filter((u) => !activeTeam?.members?.some((m) => m.id === u.id))
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || u.username} ({u.email})
                </option>
              ))}
          </Select>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <Button type="button" variant="secondary" onClick={() => setAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add to Team</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

