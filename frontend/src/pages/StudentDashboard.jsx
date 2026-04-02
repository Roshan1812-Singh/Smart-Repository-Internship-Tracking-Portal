import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import StatCard from "../components/ui/StatCard";
import ProgressBar from "../components/ui/ProgressBar";
import Timeline from "../components/ui/Timeline";
import Badge from "../components/ui/Badge";

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });
  const [internship, setInternship] = useState(null);
  const [progress, setProgress] = useState(0);
  const [mentor, setMentor] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [notices, setNotices] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats (internship counts)
        const dashboardRes = await API.get("/dashboard/student");
        setStats(dashboardRes.data);

        // Fetch internship details
        const internshipRes = await API.get("/internship/student");
        const internshipObject = internshipRes.data[0] || null;
        setInternship(internshipObject);

        // Fetch progress tasks and calculate progress percent
        const tasksRes = await API.get("/progress/student");
        const tasks = tasksRes.data || [];
        const completedTasks = tasks.filter((t) => t.status === "completed").length;
        const totalProgress = tasks.length
          ? Math.round(tasks.reduce((acc, t) => acc + (t.progressPercentage || 0), 0) / tasks.length)
          : dashboardRes.data.total
          ? Math.round((dashboardRes.data.approved / dashboardRes.data.total) * 100)
          : 0;
        setProgress(totalProgress);
        setCompletedTasks(completedTasks);

        // Upcoming deadlines from tasks
        const upcoming = tasks
          .filter((task) => task.deadline && new Date(task.deadline) > new Date())
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setDeadlines(upcoming);

        // Mentor info
        const mentorRes = await API.get("/students/profile");
        setMentor(mentorRes.data.student?.mentor || null);

        // Mentor feedback messages (only feedback type)
        const feedbackRes = await API.get("/messages");
        const messages = feedbackRes.data.messages || [];
        const feedbackMessages = messages
          .filter((msg) => msg.type === "feedback" && msg.receiver?._id === user?._id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setFeedback(feedbackMessages);

        // Admin notices/announcements from notifications endpoint
        const noticesRes = await API.get("/students/notifications");
        const noticesData = noticesRes.data.notifications || [];
        setNotices(noticesData);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900/50 dark:to-emerald-900/20 overflow-hidden">
      {/* Floating elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-r from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto relative z-10 space-y-16"
      >
        {/* Hero Header */}
        <HeroHeader 
          title={`Welcome back, ${user?.name || 'Student'}!`}
          subtitle="Track your internship progress, deadlines, and mentor feedback in one beautiful dashboard."
          ctaText="View Quick Stats →"
        />

        {/* Overall Progress */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/40 max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl text-white font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Overall Progress
            </h2>
            <div className="w-48 h-48 mx-auto bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex flex-col items-center justify-center shadow-2xl p-8">
              <div className="text-5xl font-black text-white drop-shadow-lg">{Math.round(progress)}%</div>
              <div className="text-white/90 text-sm font-medium mt-1">Internship Completion</div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                {/* <Badge 
                  status={internship?.status || 'PENDING'} 
                  className="text-lg px-6 py-2 !bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg" 
                /> */}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Status</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{internship?.status?.toUpperCase() || 'PENDING'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Mentor</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{mentor?.name || 'Not Assigned'}</span>
                </div>
                {internship?.companyName && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Company</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{internship.companyName}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <ProgressBar value={progress} label="Overall" color="from-emerald-500 to-teal-600" />
              <ProgressBar value={stats.approved / (stats.approved + stats.rejected + stats.pending + 1) * 100 || 0} label="Approval Rate" color="from-emerald-400 to-green-500" />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          <StatCard 
            title="Approved Applications" 
            value={stats.approved} 
            color="from-emerald-500 to-teal-600"
            icon="bg-emerald-500"
          />
          <StatCard 
            title="Pending Reviews" 
            value={stats.pending} 
            color="from-amber-500 to-orange-500"
            icon="bg-amber-500"
          />
          <StatCard 
            title="Rejected Applications" 
            value={stats.rejected} 
            color="from-red-500 to-rose-600"
            icon="bg-red-500"
          />
          <StatCard 
            title="Completed Tasks" 
            value={completedTasks} 
            color="from-blue-500 to-indigo-600"
            icon="bg-blue-500"
          />
        </motion.div>

        {/* Upcoming Deadlines Timeline */}
        <motion.section 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-3xl text-white font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-10 text-center">
            Upcoming Deadlines
          </h3>
{deadlines.length > 0 ? (
            <Timeline
              events={deadlines.map(task => ({
                title: task.taskTitle,
                date: new Date(task.deadline).toLocaleDateString(),
                status: 'upcoming',
                description: `Due ${new Date(task.deadline).toLocaleDateString()}`
              })) || []}
            />
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-12 shadow-xl"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No deadlines!</h4>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                You're all caught up. Great job staying on track!
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* Latest Feedback */}
        <motion.section 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <h3 className="text-3xl text-white font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent col-span-full mb-10 text-center md:col-span-1 md:text-left">
            Latest Mentor Feedback
          </h3>
          {feedback.length > 0 ? (
            feedback.map((msg, idx) => (
              <motion.div 
                key={msg._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + idx * 0.1 }}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border border-white/40 group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-lg truncate">{msg.sender?.name || 'Mentor'}</p>
                    <p className="text-xs text-gray-500 mb-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all">
                  {msg.message}
                </p>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full md:col-span-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-12 shadow-xl text-center border border-white/40"
            >
              <div className="text-6xl mb-6 opacity-40">💭</div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No feedback yet</h4>
              <p className="text-lg text-gray-600 dark:text-gray-400">Your mentor will share feedback here. Keep up the great work!</p>
            </motion.div>
          )}
        </motion.section>

        {/* Admin Notices */}
        <motion.section 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-3xl text-white font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-10 text-center">
            Notice Board
          </h3>
          {notices.length > 0 ? (
            <div className="space-y-6">
              {notices.map((notice) => (
                <motion.div
                  key={notice._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/40"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      📢 Admin Announcement
                    </h4>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        text={new Date(notice.createdAt).toLocaleDateString()} 
                        color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      />
                      {notice.expiryDate && (
                        <Badge 
                          text={`Expires: ${new Date(notice.expiryDate).toLocaleDateString()}`}
                          color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {notice.message}
                  </p>
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Sent by: {notice.sender?.name || 'Admin'}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-12 shadow-xl"
            >
              <div className="text-6xl mb-6 opacity-40">📢</div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No notices yet</h4>
              <p className="text-lg text-gray-600 dark:text-gray-400">Important announcements will appear here.</p>
            </motion.div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
