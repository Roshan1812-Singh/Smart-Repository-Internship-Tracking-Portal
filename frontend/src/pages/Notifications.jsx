import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const Notifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("student");
  const [expiryDate, setExpiryDate] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/notifications?role=all");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message required");
      return;
    }
    
    setSending(true);
    try {
      const payload = { title, message, targetRole };
      if (expiryDate) {
        payload.expiryDate = expiryDate;
      }
      await API.post("/admin/notifications", payload);
      toast.success("Notice sent successfully!");
      setTitle("");
      setMessage("");
      setExpiryDate("");
      fetchNotifications(); // Refresh list
    } catch (err) {
      toast.error("Failed to send notice");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Admin Noticeboard
        </h1>
        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? "..." : "🔄 Refresh"}
        </button>
      </div>

      {/* SEND NEW */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-12 shadow-2xl">
        <h2 className="text-2xl font-bold mb-8">📤 Send New Notice</h2>
        <form onSubmit={handleSend} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
          <div>
            <label className="block text-sm font-semibold mb-3 text-white">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-all"
              placeholder="Important Announcement..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3 text-white">Target Audience</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full p-4 bg-gray-600 border border-white/20 rounded-2xl text-white focus:border-blue-400 focus:outline-none transition-all"
            >
              <option value="student">👨‍🎓 Students</option>
              <option value="mentor">👨‍🏫 Mentors</option>
              <option value="all">🌐 All Users</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3 text-white">Expiry Date (Optional)</label>
            <input
              type="datetime-local"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-all"
              placeholder="Leave empty for no expiry"
            />
            <p className="text-xs text-gray-400 mt-1">Notice will be automatically removed after this date</p>
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-semibold mb-3 text-white">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-all resize-vertical"
              placeholder="Enter your detailed message here..."
              required
            />
          </div>
          <div className="lg:col-span-3">
            <button 
              type="submit" 
              disabled={sending || !title.trim() || !message.trim()}
              className="w-full lg:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
            >
              {sending ? "📤 Sending..." : "📤 Send Notice to All"}
            </button>
          </div>
        </form>
      </div>

      {/* SENT NOTICES */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          📋 Sent Notices ({notifications.length})
        </h2>
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-3xl p-12 border-2 border-dashed border-gray-600">
            <div className="text-5xl mb-4 opacity-30">📭</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">No notices sent yet</h3>
            <p className="text-gray-500 mb-4">Use the form above to send your first announcement</p>
            <button 
              onClick={handleSend}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium"
            >
              Send First Notice
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map((notice) => (
              <div key={notice._id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-blue-400 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      notice.targetRole === 'student' ? 'bg-blue-500/20 text-blue-300' :
                      notice.targetRole === 'mentor' ? 'bg-green-500/20 text-green-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {notice.targetRole.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                    {notice.expiryDate && (
                      <span className="text-xs text-red-400">
                        Expires: {new Date(notice.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:line-clamp-2 transition-all">{notice.title}</h3>
                <p className="text-sm text-gray-300 line-clamp-3 mb-4">{notice.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>By {notice.sender?.name}</span>
                  <span>•</span>
                  <span>Seen by {notice.readBy?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

