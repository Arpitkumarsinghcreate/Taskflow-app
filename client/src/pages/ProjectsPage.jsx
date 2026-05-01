import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import useAuthStore from '../store/authStore';
import StatusPill from '../components/ui/StatusPill';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { FolderPlus } from 'lucide-react';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#1D9E75');

  const colors = ['#1D9E75', '#185FA5', '#BA7517', '#534AB7', '#D4537E', '#E24B4A'];

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getAll();
      setProjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onSubmit = async (data) => {
    try {
      await projectService.create({ ...data, color: selectedColor });
      toast.success('Project created successfully');
      setIsModalOpen(false);
      reset();
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-[#f0f0f0]">Projects</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1D9E75] hover:bg-[#17875f] text-white text-xs px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
          >
            <FolderPlus size={14} />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton count={6} height="h-40" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          description="Get started by creating your first project to manage tasks with your team."
          actionLabel={user?.role === 'admin' ? "Create Project" : null}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#2e2e2e] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <h3 className="text-[#f0f0f0] font-medium truncate group-hover:text-[#1D9E75] transition-colors">
                    {project.name}
                  </h3>
                </div>
                <StatusPill status={project.status} />
              </div>

              <p className="text-xs text-[#444] line-clamp-2 mb-4 h-8">
                {project.description || 'No description provided.'}
              </p>

              <div className="space-y-2">
                <div className="bg-[#1a1a1a] rounded-full h-1">
                  <div 
                    className="bg-[#1D9E75] rounded-full h-1 transition-all duration-500" 
                    style={{ width: `${project.completionPct || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2 overflow-hidden">
                    {project.members?.slice(0, 3).map((member, i) => (
                      <div 
                        key={i}
                        className="w-6 h-6 rounded-full bg-[#1a3a2a] border border-[#0f0f0f] text-[#1D9E75] text-[9px] font-medium flex items-center justify-center"
                        title={member.user?.fullName}
                      >
                        {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                      </div>
                    ))}
                    {project.members?.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-[#111] border border-[#0f0f0f] text-[#444] text-[9px] font-medium flex items-center justify-center">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#444]">{project.taskCount || 0} tasks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title="Create New Project"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[10px] text-[#555] tracking-widest mb-1.5 uppercase">PROJECT NAME</label>
            <input
              {...register('name', { required: 'Project name is required' })}
              className={`w-full px-3 py-2 bg-[#111] border rounded-md text-sm text-[#e8e8e8] outline-none focus:border-[#1D9E75] ${errors.name ? 'border-[#cc4444]' : 'border-[#1e1e1e]'}`}
              placeholder="e.g. Website Redesign"
            />
            {errors.name && <p className="text-[10px] text-[#cc4444] mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] text-[#555] tracking-widest mb-1.5 uppercase">DESCRIPTION</label>
            <textarea
              {...register('description')}
              rows="3"
              className="w-full px-3 py-2 bg-[#111] border border-[#1e1e1e] rounded-md text-sm text-[#e8e8e8] outline-none focus:border-[#1D9E75] resize-none"
              placeholder="What is this project about?"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-[#555] tracking-widest mb-1.5 uppercase">PRIORITY</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 bg-[#111] border border-[#1e1e1e] rounded-md text-sm text-[#e8e8e8] outline-none focus:border-[#1D9E75]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#555] tracking-widest mb-1.5 uppercase">DUE DATE</label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-3 py-2 bg-[#111] border border-[#1e1e1e] rounded-md text-sm text-[#e8e8e8] outline-none focus:border-[#1D9E75]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#555] tracking-widest mb-1.5 uppercase">THEME COLOR</label>
            <div className="flex gap-2.5 mt-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${selectedColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                ></button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="text-xs text-[#555] hover:text-[#888] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1D9E75] hover:bg-[#17875f] text-white text-xs px-6 py-2 rounded-md font-medium transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
