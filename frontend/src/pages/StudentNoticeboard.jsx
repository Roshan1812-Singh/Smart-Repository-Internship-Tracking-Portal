import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const StudentNoticeboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readStatus, setReadStatus] = useState({});

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/notifications?role=student");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await API.put(`/admin/notifications/${notificationId}/read`);
      setReadStatus(prev => ({ ...prev, [notificationId]: true }));
      toast.success("Marked as read");
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p>Loading notices...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !readStatus[n._id]).length;

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
            📢 Student Noticeboard
          </h1>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-1 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              {unreadCount} unread notice{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <button
          onClick={fetchNotifications}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-medium transition-all hover:scale-105"
        >
          🔄 Refresh
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-6 opacity-20">📭</div>
          <h2 className="text-2xl font-bold text-gray-400 mb-3">No notices yet</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Check back later for important announcements from administration.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notice) => {
            const isRead = readStatus[notice._id];
            return (
              <div 
                key={notice._id} 
                className={`group backdrop-blur-xl border ${
                  isRead 
                    ? 'border-gray-700/50 bg-white/5' 
                    : 'border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20'
                } rounded-3xl p-8 transition-all hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isRead ? 'bg-gray-500' : 'bg-blue-400 animate-pulse'
                    }`}></div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      notice.targetRole === 'student' ? 'bg-blue-100 text-blue-800' :
                      notice.targetRole === 'all' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {notice.targetRole === 'all' ? 'ALL' : notice.targetRole.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    {new Date(notice.createdAt).toLocaleString()}
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-3 text-white line-clamp-1 group-hover:line-clamp-none">
                  {notice.title}
                </h2>
                <p className="text-gray-200 leading-relaxed mb-6 line-clamp-4 group-hover:line-clamp-none">
                  {notice.message}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>By <span className="font-semibold text-white">{notice.sender?.name}</span></span>
                  {isRead ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                      ✓ Read
                    </span>
                  ) : (
                    <button
                      onClick={() => markAsRead(notice._id)}
                      className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-all"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentNoticeboard;

