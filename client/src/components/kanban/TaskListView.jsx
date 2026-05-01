import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { taskService } from '../../services/taskService';
import StatusPill from '../ui/StatusPill';
import PriorityDot from '../ui/PriorityDot';
import useAuthStore from '../../store/authStore';
import TaskDetailModal from '../task/TaskDetailModal';

const TaskListView = ({ tasks, projectMembers, onTaskUpdate }) => {
  const { user } = useAuthStore();
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus });
      toast.success('Task status updated');
      onTaskUpdate();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.delete(taskId);
      toast.success('Task deleted');
      onTaskUpdate();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b border-[#1e1e1e]">
            <th className="pb-3 text-[10px] font-medium text-[#555] tracking-widest uppercase px-2">TITLE</th>
            <th className="pb-3 text-[10px] font-medium text-[#555] tracking-widest uppercase px-2">ASSIGNEE</th>
            <th className="pb-3 text-[10px] font-medium text-[#555] tracking-widest uppercase px-2">PRIORITY</th>
            <th className="pb-3 text-[10px] font-medium text-[#555] tracking-widest uppercase px-2">STATUS</th>
            <th className="pb-3 text-[10px] font-medium text-[#555] tracking-widest uppercase px-2">DUE DATE</th>
            <th className="pb-3 text-[10px] font-medium text-[#555] tracking-widest uppercase px-2 text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e1e1e]/50">
          {tasks.map((task) => (
            <tr 
              key={task._id} 
              onClick={() => setSelectedTaskId(task._id)}
              className="hover:bg-[#111] transition-colors group cursor-pointer"
            >
              <td className="py-3 px-2">
                <p className="text-sm text-[#e8e8e8] font-medium">{task.title}</p>
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#1a3a2a] text-[#1D9E75] flex items-center justify-center text-[8px] font-medium">
                    {task.assignee ? `${task.assignee.firstName[0]}${task.assignee.lastName[0]}` : '?'}
                  </div>
                  <span className="text-xs text-[#555]">{task.assignee?.firstName || 'Unassigned'}</span>
                </div>
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <PriorityDot priority={task.priority} />
                  <span className="text-xs text-[#555] capitalize">{task.priority}</span>
                </div>
              </td>
              <td className="py-3 px-2">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="bg-transparent text-xs text-[#888] outline-none cursor-pointer focus:text-[#1D9E75]"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="overdue">Overdue</option>
                </select>
              </td>
              <td className="py-3 px-2">
                <span className={`text-xs ${task.status === 'overdue' ? 'text-[#cc4444]' : 'text-[#555]'}`}>
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}
                </span>
              </td>
              <td className="py-3 px-2 text-right">
                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[#333] hover:text-[#1D9E75] transition-colors">
                    <Edit2 size={14} />
                  </button>
                  {(user?.role === 'admin' || task.createdBy === user?._id) && (
                    <button 
                      onClick={() => handleDelete(task._id)}
                      className="text-[#333] hover:text-[#cc4444] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <TaskDetailModal 
        isOpen={!!selectedTaskId} 
        taskId={selectedTaskId} 
        onClose={() => setSelectedTaskId(null)} 
        projectMembers={projectMembers} 
        onTaskUpdated={onTaskUpdate} 
      />
    </div>
  );
};

export default TaskListView;
