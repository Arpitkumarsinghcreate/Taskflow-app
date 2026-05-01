import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await userService.getNotifications();
      setNotifications(res.data.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await userService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await userService.markNotificationRead(n._id);
        setNotifications(prev => prev.map(item => 
          item._id === n._id ? { ...item, isRead: true } : item
        ));
      } catch (err) {
        console.error('Failed to mark notification as read');
      }
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  if (loading) return <LoadingSkeleton count={5} height="h-24" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-medium text-[#f0f0f0]">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-[#1D9E75] hover:underline transition-all"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl overflow-hidden">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`flex gap-3 p-4 border-b border-[#1e1e1e] cursor-pointer transition-colors ${
                !n.isRead ? 'bg-[#0d1a0d]' : 'hover:bg-[#111]'
              }`}
            >
              <div className="flex-shrink-0">
                {n.sender ? (
                  <div className="w-8 h-8 rounded-full bg-[#1a3a2a] text-[#1D9E75] flex items-center justify-center text-xs font-medium">
                    {n.sender.firstName[0]}{n.sender.lastName[0]}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#111] text-[#444] flex items-center justify-center">
                    <Bell size={16} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'text-[#e8e8e8]' : 'text-[#555]'}`}>
                  {n.message}
                </p>
                <p className="text-[10px] text-[#444] mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>

              {!n.isRead && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mt-1.5 flex-shrink-0"></div>
              )}
            </div>
          ))
        ) : (
          <EmptyState
            icon={CheckCircle}
            title="You're all caught up!"
            description="No notifications yet"
          />
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
