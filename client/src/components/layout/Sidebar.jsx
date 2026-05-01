import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Bell, User, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { projectService } from '../../services/projectService';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getAll();
        setProjects(res.data.data);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/auth');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Tasks', icon: CheckSquare, path: '/tasks/my' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <aside className="w-56 bg-[#0f0f0f] border-r border-[#1e1e1e] h-full flex flex-col shrink-0">
      {/* TOP - Logo */}
      <div className="h-14 border-b border-[#1e1e1e] px-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#1D9E75]"></div>
        <span className="text-[#f0f0f0] text-sm font-medium">TaskFlow</span>
      </div>

      {/* NAV SECTION */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10px] text-[#333] tracking-widest px-2 mb-2 uppercase">WORKSPACE</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-all cursor-pointer ${
                  isActive ? 'bg-[#111] text-[#f0f0f0]' : 'text-[#555] hover:text-[#888] hover:bg-[#111]'
                }`
              }
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <p className="text-[10px] text-[#333] tracking-widest px-2 mb-2 mt-5 uppercase">PROJECTS</p>
        <div className="flex flex-col gap-1">
          {loading ? (
            <div className="px-2 space-y-2">
              <div className="h-2 bg-[#111] rounded w-full animate-pulse"></div>
              <div className="h-2 bg-[#111] rounded w-3/4 animate-pulse"></div>
            </div>
          ) : (
            projects.map((project) => (
              <NavLink
                key={project._id}
                to={`/projects/${project._id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all cursor-pointer ${
                    isActive ? 'bg-[#111] text-[#f0f0f0]' : 'text-[#555] hover:text-[#888] hover:bg-[#111]'
                  }`
                }
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: project.color }}></div>
                <span className="truncate">{project.name}</span>
              </NavLink>
            ))
          )}
        </div>
      </div>

      {/* BOTTOM - User section */}
      <div className="border-t border-[#1e1e1e] p-3">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 p-2 rounded-md hover:bg-[#111] cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-[#1a3a2a] text-[#1D9E75] flex items-center justify-center text-xs font-medium shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#888] truncate">{user?.fullName}</p>
            <p className="text-[10px] text-[#333] capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[#333] group-hover:text-[#555] transition-colors"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
