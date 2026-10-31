import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Send,
  Paperclip,
  Clock,
  History,
  MessageSquare,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react';
import { issuesApi, commentsApi, attachmentsApi, labelsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, PriorityIndicator, TypeBadge, Avatar, Button, Select, Skeleton } from '../components/ui';

export function IssueDetailPage() {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const { addToast } = useToast();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [issueLabels, setIssueLabels] = useState([]);
  const [allLabels, setAllLabels] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadIssueData();
  }, [id]);

  async function loadIssueData() {
    setLoading(true);
    try {
      const [issueRes, commentsRes, attachRes, labelsRes, allLabelsRes, historyRes] =
        await Promise.all([
          issuesApi.getById(id),
          commentsApi.getByIssue(id).catch(() => ({ data: [] })),
          attachmentsApi.getByIssue(id).catch(() => ({ data: [] })),
          labelsApi.getByIssue(id).catch(() => ({ data: [] })),
          labelsApi.getAll().catch(() => ({ data: [] })),
          issuesApi.getHistory(id).catch(() => ({ data: [] })),
        ]);

      if (issueRes?.data) setIssue(issueRes.data);
      if (commentsRes?.data) setComments(commentsRes.data);
      if (attachRes?.data) setAttachments(attachRes.data);
      if (labelsRes?.data) setIssueLabels(labelsRes.data);
      if (allLabelsRes?.data) setAllLabels(allLabelsRes.data);
      if (historyRes?.data) setHistory(historyRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to load issue', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await issuesApi.transitionStatus(id, newStatus);
      addToast('Status updated', 'success');
      loadIssueData();
    } catch (err) {
      addToast(err.message || 'Failed to transition status', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentSubmitting(true);
    try {
      await commentsApi.add(id, { content: newComment.trim() });
      setNewComment('');
      addToast('Comment added', 'success');
      const cRes = await commentsApi.getByIssue(id);
      if (cRes?.data) setComments(cRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsApi.delete(commentId);
      addToast('Comment deleted', 'success');
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      addToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await attachmentsApi.upload(id, formData);
      addToast('File attached', 'success');
      const aRes = await attachmentsApi.getByIssue(id);
      if (aRes?.data) setAttachments(aRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to attach file', 'error');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleAssignLabel = async (labelId) => {
    if (!labelId) return;
    try {
      await labelsApi.assign(id, labelId);
      addToast('Label added', 'success');
      const lRes = await labelsApi.getByIssue(id);
      if (lRes?.data) setIssueLabels(lRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to attach label', 'error');
    }
  };

  const handleRemoveLabel = async (labelId) => {
    try {
      await labelsApi.remove(id, labelId);
      addToast('Label removed', 'success');
      setIssueLabels((prev) => prev.filter((l) => l.id !== labelId));
    } catch (err) {
      addToast(err.message || 'Failed to remove label', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!issue) {
    return <div className="text-center p-12 text-sm text-gray-400">Issue not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Link
          to={`/projects/${issue.projectId}`}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {issue.projectName}
        </Link>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-xs font-semibold text-gray-400">
            {issue.projectKey}-{issue.id}
          </span>
          <TypeBadge type={issue.issueType} />
        </div>
        <h1 className="text-xl font-bold text-gray-100">{issue.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card border border-surface-border rounded-md p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Description
            </h3>
            {issue.description ? (
              <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                {issue.description}
              </p>
            ) : (
              <p className="text-xs text-gray-500 italic">No description provided.</p>
            )}
          </div>

          <div className="bg-surface-card border border-surface-border rounded-md overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border flex items-center gap-4 text-xs">
              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-1 font-medium border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'comments'
                    ? 'border-brand-500 text-brand-400 font-semibold'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Comments ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                className={`pb-1 font-medium border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'attachments'
                    ? 'border-brand-500 text-brand-400 font-semibold'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" /> Attachments ({attachments.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-1 font-medium border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'border-brand-500 text-brand-400 font-semibold'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <History className="w-3.5 h-3.5" /> History ({history.length})
              </button>
            </div>

            <div className="p-5">
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddComment} className="space-y-2">
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add an engineering note or comment..."
                      className="w-full bg-surface border border-surface-border rounded px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
                    />
                    <div className="flex justify-end">
                      <Button size="sm" type="submit" disabled={commentSubmitting || !newComment.trim()}>
                        <Send className="w-3 h-3 mr-1" />
                        {commentSubmitting ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </form>

                  <div className="divide-y divide-surface-border pt-2">
                    {comments.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-500">
                        No comments yet. Start the conversation.
                      </div>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="py-3 flex gap-3 text-xs">
                          <Avatar user={c.author} size="sm" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-200">{c.author.fullName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-gray-500">
                                  {new Date(c.createdAt).toLocaleString()}
                                </span>
                                {(c.author.id === user?.id || hasRole('ADMIN')) && (
                                  <button
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="text-gray-500 hover:text-red-400"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-surface-border pb-3">
                    <span className="text-xs text-gray-400">Attached files ({attachments.length})</span>
                    <label className="cursor-pointer">
                      <Button size="sm" variant="secondary" disabled={uploadingFile} as="span">
                        <Paperclip className="w-3 h-3 mr-1.5" />
                        {uploadingFile ? 'Uploading...' : 'Upload File'}
                      </Button>
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>

                  {attachments.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500">No attachments uploaded yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {attachments.map((a) => (
                        <div
                          key={a.id}
                          className="bg-surface border border-surface-border rounded p-3 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-medium text-gray-200 truncate">{a.originalFileName}</p>
                            <p className="text-[11px] text-gray-500">{(a.fileSize / 1024).toFixed(1)} KB</p>
                          </div>
                          <a
                            href={attachmentsApi.getDownloadUrl(a.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  {history.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500">No history logged yet.</div>
                  ) : (
                    <div className="divide-y divide-surface-border">
                      {history.map((h) => (
                        <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-gray-200">{h.changedBy?.fullName}</span>{' '}
                            <span className="text-gray-400">changed</span>{' '}
                            <span className="font-mono text-gray-300">{h.fieldName}</span>{' '}
                            {h.oldValue && (
                              <>
                                <span className="text-gray-500">from</span>{' '}
                                <span className="text-rose-400">{h.oldValue}</span>{' '}
                              </>
                            )}
                            <span className="text-gray-500">to</span>{' '}
                            <span className="text-emerald-400">{h.newValue}</span>
                          </div>
                          <span className="text-[11px] text-gray-500">
                            {new Date(h.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-card border border-surface-border rounded-md p-4 space-y-4 text-xs">
            <h3 className="font-semibold text-gray-300 uppercase tracking-wider text-[11px]">Details</h3>

            <div className="space-y-1">
              <label className="text-gray-400">Status</label>
              <Select
                value={issue.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs"
              >
                <option value="TO_DO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Priority</label>
              <div>
                <PriorityIndicator priority={issue.priority} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Assignee</label>
              <div className="flex items-center gap-2">
                <Avatar user={issue.assignee} size="sm" />
                <span className="text-gray-200">{issue.assignee?.fullName || 'Unassigned'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Reporter</label>
              <div className="flex items-center gap-2">
                <Avatar user={issue.reporter} size="sm" />
                <span className="text-gray-200">{issue.reporter?.fullName}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Due Date</label>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{issue.dueDate || 'No due date'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Created</label>
              <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>{new Date(issue.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-md p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <TagIcon className="w-3 h-3" /> Labels
              </h3>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {issueLabels.map((l) => (
                <span
                  key={l.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-surface border border-surface-border text-gray-300"
                >
                  {l.name}
                  <button
                    onClick={() => handleRemoveLabel(l.id)}
                    className="hover:text-red-400 text-gray-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <Select
              onChange={(e) => {
                handleAssignLabel(e.target.value);
                e.target.value = '';
              }}
              className="text-xs"
            >
              <option value="">+ Add Label</option>
              {allLabels
                .filter((al) => !issueLabels.some((il) => il.id === al.id))
                .map((al) => (
                  <option key={al.id} value={al.id}>
                    {al.name}
                  </option>
                ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

