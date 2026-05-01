import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { userService } from '../../services/userService';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await userService.getNotifications();
      const unread = res.data.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications count');
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path.startsWith('/projects/')) return 'Project Detail';
    if (path === '/tasks/my') return 'My Tasks';
    if (path === '/notifications') return 'Notifications';
    return 'TaskFlow';
  };

  return (
    <header className="h-14 border-b border-[#1e1e1e] bg-[#0f0f0f] flex items-center justify-between px-6 shrink-0">
      <div className="text-sm font-medium text-[#f0f0f0]">
        {getPageTitle()}
      </div>

      <div className="flex items-center gap-3">
        <button 
          className="relative text-[#555] hover:text-[#888] transition-colors p-1"
          onClick={() => navigate('/notifications')}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#cc4444] text-[9px] text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>

        <div className="w-7 h-7 rounded-full bg-[#1a3a2a] text-[#1D9E75] flex items-center justify-center text-[10px] font-medium cursor-pointer">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
