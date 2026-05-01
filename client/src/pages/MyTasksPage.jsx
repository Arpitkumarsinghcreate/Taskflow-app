import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import StatusPill from '../components/ui/StatusPill';
import PriorityDot from '../components/ui/PriorityDot';
import TaskDetailModal from '../components/task/TaskDetailModal';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await taskService.getMyTasks();
      setTasks(res.data.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filters = {
    status: [
      { label: 'All', value: 'all' },
      { label: 'To Do', value: 'todo' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Done', value: 'done' },
      { label: 'Overdue', value: 'overdue' },
    ],
    priority: [
      { label: 'All', value: 'all' },
      { label: 'High', value: 'high' },
      { label: 'Medium', value: 'medium' },
      { label: 'Low', value: 'low' },
    ]
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  if (loading) return <LoadingSkeleton count={5} height="h-20" />;

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-medium text-[#f0f0f0]">My Tasks</h1>
        <span className="bg-[#1a1a1a] text-[#555] text-xs px-2 py-0.5 rounded-full">
          {filteredTasks.length}
        </span>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {filters.status.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors border ${
                statusFilter === f.value
                  ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                  : 'border-[#1e1e1e] text-[#555] hover:border-[#2e2e2e]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.priority.map(f => (
            <button
              key={f.value}
              onClick={() => setPriorityFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors border ${
                priorityFilter === f.value
                  ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                  : 'border-[#1e1e1e] text-[#555] hover:border-[#2e2e2e]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* TASK LIST */}
      <div className="flex flex-col gap-2">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div
              key={task._id}
              onClick={() => setSelectedTaskId(task._id)}
              className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#2e2e2e] cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <PriorityDot priority={task.priority} />
                <div>
                  <p className="text-sm text-[#e8e8e8] font-medium">{task.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: task.project?.color || '#333' }}
                    ></div>
                    <p className="text-xs text-[#444]">{task.project?.name || 'No Project'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusPill status={task.status} />
                {task.dueDate && (
                  <span className={`text-xs ${
                    task.status === 'overdue' ? 'text-[#cc4444]' : 'text-[#444]'
                  }`}>
                    {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <EmptyState 
            title="No tasks found" 
            description="Try adjusting your filters" 
          />
        )}
      </div>

      {selectedTaskId && (
        <TaskDetailModal
          isOpen={!!selectedTaskId}
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={fetchTasks}
          // Note: MyTasks doesn't have projectMembers context easily available here
          // We might need to fetch project details or adjust TaskDetailModal to fetch members if not provided
          projectMembers={tasks.find(t => t._id === selectedTaskId)?.project?.members || []}
        />
      )}
    </div>
  );
};

export default MyTasksPage;
