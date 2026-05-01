import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import { taskService } from '../../services/taskService';
import useAuthStore from '../../store/authStore';
import Modal from '../ui/Modal';
import StatusPill from '../ui/StatusPill';
import PriorityDot from '../ui/PriorityDot';

const TaskDetailModal = ({ taskId, isOpen, onClose, onTaskUpdated, projectMembers }) => {
  const { user: currentUser } = useAuthStore();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [commentText, setCommentText] = useState('');

  const fetchTask = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await taskService.getById(taskId);
      setTask(res.data.data);
    } catch (err) {
      toast.error('Failed to load task details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTask();
    }
  }, [taskId, isOpen]);

  const handleUpdate = async (fields) => {
    try {
      await taskService.update(task._id, fields);
      setTask({ ...task, ...fields });
      onTaskUpdated();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await taskService.addComment(task._id, { text: commentText });
      setTask({ ...task, comments: res.data.data });
      setCommentText('');
      onTaskUpdated();
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(task._id);
      toast.success('Task deleted');
      onTaskUpdated();
      onClose();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const MetaSection = ({ label, children }) => (
    <div className="mb-6">
      <label className="text-[10px] text-[#444] tracking-widest uppercase mb-2 block font-medium">
        {label}
      </label>
      {children}
    </div>
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      {loading || !task ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-[#1D9E75] border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="flex gap-6 max-h-[85vh]">
          {/* LEFT COLUMN */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {editingTitle ? (
              <input
                autoFocus
                className="text-lg font-medium text-[#f0f0f0] bg-transparent border-b border-[#1D9E75] outline-none w-full mb-4"
                defaultValue={task.title}
                onBlur={(e) => {
                  if (e.target.value !== task.title) handleUpdate({ title: e.target.value });
                  setEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.target.blur();
                }}
              />
            ) : (
              <h2 
                className="text-lg font-medium text-[#f0f0f0] cursor-pointer hover:text-white mb-4"
                onClick={() => setEditingTitle(true)}
              >
                {task.title}
              </h2>
            )}

            <div className="mb-8">
              <label className="text-[10px] text-[#444] tracking-widest uppercase mb-2 block font-medium">DESCRIPTION</label>
              <textarea
                className="w-full bg-transparent border-none text-sm text-[#888] focus:text-[#e8e8e8] outline-none resize-none min-h-[100px] p-0 placeholder-[#333]"
                placeholder="Add a description..."
                defaultValue={task.description}
                onBlur={(e) => {
                  if (e.target.value !== task.description) handleUpdate({ description: e.target.value });
                }}
              ></textarea>
            </div>

            {/* COMMENTS */}
            <div className="mt-8 border-t border-[#1e1e1e] pt-6">
              <h3 className="text-sm font-medium text-[#888] mb-6">Comments</h3>
              
              <div className="space-y-6 mb-8">
                {task.comments?.length > 0 ? (
                  task.comments.map((comment, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1a3a2a] text-[#1D9E75] flex items-center justify-center text-[10px] font-medium shrink-0">
                        {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-[#888]">{comment.author?.fullName}</span>
                          <span className="text-[10px] text-[#444]">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-[#666] leading-relaxed break-words">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#444] italic">No comments yet</p>
                )}
              </div>

              {/* ADD COMMENT */}
              <form onSubmit={handleAddComment} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-[#1a3a2a] text-[#1D9E75] flex items-center justify-center text-[10px] font-medium shrink-0">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <textarea
                    rows="2"
                    placeholder="Write a comment..."
                    className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg text-sm text-[#888] p-2.5 focus:border-[#1D9E75] outline-none resize-none transition-colors"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="bg-[#1D9E75] hover:bg-[#17875f] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-4 py-1.5 rounded-md font-medium transition-colors"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-56 flex-shrink-0 border-l border-[#1e1e1e] pl-6 overflow-y-auto custom-scrollbar">
            <MetaSection label="STATUS">
              <div className="mb-2">
                <StatusPill status={task.status} />
              </div>
              <select
                className="w-full bg-[#111] border border-[#1e1e1e] rounded-md text-xs text-[#888] p-1.5 outline-none focus:border-[#1D9E75]"
                value={task.status}
                onChange={(e) => handleUpdate({ status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="overdue">Overdue</option>
              </select>
            </MetaSection>

            <MetaSection label="PRIORITY">
              <div className="flex items-center gap-2 mb-2">
                <PriorityDot priority={task.priority} />
                <span className="text-xs text-[#888] capitalize">{task.priority}</span>
              </div>
              <select
                className="w-full bg-[#111] border border-[#1e1e1e] rounded-md text-xs text-[#888] p-1.5 outline-none focus:border-[#1D9E75]"
                value={task.priority}
                onChange={(e) => handleUpdate({ priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </MetaSection>

            <MetaSection label="ASSIGNEE">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-[#1a3a2a] text-[#1D9E75] flex items-center justify-center text-[8px] font-medium">
                  {task.assignee ? `${task.assignee.firstName[0]}${task.assignee.lastName[0]}` : '?'}
                </div>
                <span className="text-xs text-[#888]">{task.assignee?.firstName || 'Unassigned'}</span>
              </div>
              <select
                className="w-full bg-[#111] border border-[#1e1e1e] rounded-md text-xs text-[#888] p-1.5 outline-none focus:border-[#1D9E75]"
                value={task.assignee?._id || ''}
                onChange={(e) => handleUpdate({ assignee: e.target.value || null })}
              >
                <option value="">Unassigned</option>
                {projectMembers?.map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.firstName} {m.user.lastName}
                  </option>
                ))}
              </select>
            </MetaSection>

            <MetaSection label="DUE DATE">
              <input
                type="date"
                className={`w-full bg-[#111] border border-[#1e1e1e] rounded-md text-xs p-1.5 outline-none focus:border-[#1D9E75] ${
                  task.status !== 'done' && task.dueDate && new Date(task.dueDate) < new Date() ? 'text-[#cc4444]' : 'text-[#888]'
                }`}
                value={task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => handleUpdate({ dueDate: e.target.value })}
              />
            </MetaSection>

            <MetaSection label="CREATED BY">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#111] border border-[#1e1e1e] text-[#444] flex items-center justify-center text-[8px] font-medium">
                  {task.createdBy?.firstName?.[0]}{task.createdBy?.lastName?.[0]}
                </div>
                <div>
                  <p className="text-[11px] text-[#555]">{task.createdBy?.firstName} {task.createdBy?.lastName}</p>
                  <p className="text-[9px] text-[#333]">{format(new Date(task.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </MetaSection>

            {task.tags?.length > 0 && (
              <MetaSection label="TAGS">
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, i) => (
                    <span key={i} className="bg-[#1a1a1a] text-[#555] text-[9px] px-2 py-0.5 rounded-full border border-[#1e1e1e]">
                      {tag}
                    </span>
                  ))}
                </div>
              </MetaSection>
            )}

            {(currentUser?.role === 'admin' || task.createdBy?._id === currentUser?._id) && (
              <button
                onClick={handleDelete}
                className="w-full text-[11px] text-[#cc4444] border border-[#3a1515] rounded-md py-2 mt-6 hover:bg-[#1a0a0a] transition-colors font-medium"
              >
                Delete Task
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TaskDetailModal;
