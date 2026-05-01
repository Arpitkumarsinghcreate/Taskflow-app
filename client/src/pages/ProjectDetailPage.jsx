import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import useAuthStore from '../store/authStore';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import StatusPill from '../components/ui/StatusPill';
import KanbanBoard from '../components/kanban/KanbanBoard';
import TaskListView from '../components/kanban/TaskListView';
import MembersPanel from '../components/project/MembersPanel';
import CreateTaskModal from '../components/task/CreateTaskModal';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban');
  const [showCreateTask, setShowCreateTask] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        projectService.getById(id),
        taskService.getProjectTasks(id)
      ]);
      setProject(projRes.data.data);
      setTasks(taskRes.data.data);
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <LoadingSkeleton count={3} height="h-64" />;
  if (!project) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1 text-[#555] hover:text-[#888] transition-colors text-xs w-fit"
        >
          <ArrowLeft size={14} />
          Back to projects
        </button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }}></div>
            <h1 className="text-xl font-medium text-[#f0f0f0]">{project.name}</h1>
            <StatusPill status={project.status} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2 overflow-hidden">
              {project.members?.slice(0, 5).map((member, i) => (
                <div 
                  key={i}
                  className="w-7 h-7 rounded-full bg-[#1a3a2a] border border-[#0a0a0a] text-[#1D9E75] text-[10px] font-medium flex items-center justify-center"
                  title={member.user.fullName}
                >
                  {member.user.firstName[0]}{member.user.lastName[0]}
                </div>
              ))}
              {project.members?.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-[#111] border border-[#0a0a0a] text-[#444] text-[10px] font-medium flex items-center justify-center">
                  +{project.members.length - 5}
                </div>
              )}
            </div>

            {user?.role === 'admin' && (
              <button 
                onClick={() => setShowCreateTask(true)}
                className="bg-[#1D9E75] hover:bg-[#17875f] text-white text-xs px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 font-medium"
              >
                <Plus size={14} />
                Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[#1e1e1e] gap-6">
        {['kanban', 'list', 'members'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-[#1D9E75] text-[#f0f0f0]' 
                : 'border-transparent text-[#555] hover:text-[#888]'
            } capitalize`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="mt-2">
        {activeTab === 'kanban' && (
          <KanbanBoard 
            tasks={tasks} 
            projectId={id} 
            projectMembers={project.members}
            onTaskUpdate={fetchData} 
          />
        )}
        {activeTab === 'list' && (
          <TaskListView 
            tasks={tasks} 
            projectMembers={project.members}
            onTaskUpdate={fetchData} 
          />
        )}
        {activeTab === 'members' && (
          <MembersPanel 
            project={project} 
            currentUser={user} 
            onUpdate={fetchData} 
          />
        )}
      </div>

      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        projectId={id}
        projectMembers={project.members}
        onTaskCreated={fetchData}
      />
    </div>
  );
};

export default ProjectDetailPage;
