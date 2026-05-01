import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import useAuthStore from '../store/authStore';
import StatusPill from '../components/ui/StatusPill';
import PriorityDot from '../components/ui/PriorityDot';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { CheckSquare } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          projectService.getAll(),
          taskService.getMyTasks()
        ]);
        setProjects(projRes.data.data);
        setTasks(taskRes.data.data);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'My Tasks', value: tasks.length, color: 'text-blue-400' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'text-[#f0f0f0]' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'done').length, color: 'text-[#1D9E75]' },
    { label: 'Overdue', value: tasks.filter(t => t.status === 'overdue').length, color: 'text-[#cc4444]' },
  ];

  if (loading) return <LoadingSkeleton count={4} height="h-32" />;

  return (
    <div className="flex flex-col gap-6">
      {/* SECTION 1 - Greeting */}
      <div>
        <h1 className="text-xl font-medium text-[#f0f0f0]">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.firstName}
        </h1>
        <p className="text-sm text-[#555]">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      {/* SECTION 2 - Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-4">
            <p className="text-xs text-[#555] mb-1">{stat.label}</p>
            <p className={`text-2xl font-medium ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* SECTION 3 - Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* LEFT - My Tasks */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#f0f0f0]">My Tasks</h2>
            <Link to="/tasks/my" className="text-xs text-[#1D9E75] hover:underline">View all</Link>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg p-8 text-center">
              <p className="text-sm text-[#333]">No tasks assigned to you</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 6).map(task => (
                <div key={task._id} className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg p-3 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#888] truncate">{task.title}</p>
                    <p className="text-xs text-[#444] mt-0.5">{task.project?.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <PriorityDot priority={task.priority} />
                      <StatusPill status={task.status} />
                    </div>
                    {task.dueDate && (
                      <p className="text-[10px] text-[#444]">
                        {format(new Date(task.dueDate), 'MMM d')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT - Projects summary */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#f0f0f0]">Projects</h2>
            <Link to="/projects" className="text-xs text-[#1D9E75] hover:underline">View all</Link>
          </div>

          <div className="space-y-2">
            {projects.slice(0, 4).map(project => (
              <Link 
                key={project._id} 
                to={`/projects/${project._id}`}
                className="block bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg p-3 hover:border-[#2e2e2e] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }}></div>
                  <p className="text-sm text-[#888] truncate font-medium">{project.name}</p>
                </div>
                {/* Progress bar logic - project stats would be better but we use taskCount from getAll */}
                <div className="bg-[#1a1a1a] rounded-full h-1 mt-2.5">
                  <div 
                    className="bg-[#1D9E75] rounded-full h-1" 
                    style={{ width: `${project.completionPct || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-[10px] text-[#444]">{project.taskCount || 0} tasks</p>
                  <p className="text-[10px] text-[#444]">{project.completionPct || 0}%</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
