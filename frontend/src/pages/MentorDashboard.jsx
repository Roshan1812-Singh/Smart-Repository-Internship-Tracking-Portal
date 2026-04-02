import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import StatCard from "../components/ui/StatCard";
import ProgressBar from "../components/ui/ProgressBar";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

const MentorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingReports: 0,
    completedTasks: 0,
    activeTasks: 0,
  });
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const studentsRes = await API.get("/mentor/assigned-students");
      setStudents(studentsRes.data.students || []);

      const statsRes = await API.get("/mentor/stats");
      setStats(statsRes.data);

      // Admin notices/announcements from notifications endpoint
      const noticesRes = await API.get("/mentor/notifications");
      const noticesData = noticesRes.data.notifications || [];
      setNotices(noticesData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      active: "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return `${months} months`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-900">
      <HeroHeader 
        title="Mentor Dashboard" 
        subtitle="Track progress, review reports, and guide your interns to success. Everything you need at a glance."
      />

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 text-black"
      >
        <StatCard 
          title="Assigned Interns" 
          value={stats.totalStudents}
          color="from-emerald-500 to-teal-600"
          icon="bg-emerald-400/40"
        />
        <StatCard 
          title="Pending Reviews" 
          value={stats.pendingReports}
          color="from-orange-500 to-yellow-500"
          icon="bg-orange-400/40"
        />
        <StatCard 
          title="Completed Tasks" 
          value={stats.completedTasks}
          color="from-green-500 to-emerald-600"
          icon="bg-green-400/40"
        />
        <StatCard 
          title="Active Projects" 
          value={stats.activeTasks}
          color="from-blue-500 to-indigo-600"
          icon="bg-blue-400/40"
        />
      </motion.div>

      {/* Students Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl text-white font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Your Interns ({students.length})
          </h2>
          <Badge status="active" className="!text-sm" />
        </div>

        {students.length === 0 ? (
          <Card className="text-center text-black py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg> 
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No interns assigned yet</h3>
            <p className="text-gray-200 max-w-md mx-auto">
              Your interns will appear here once assigned by the administrator. Stay tuned!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-8">
            {students.filter(Boolean).map((student, index) => (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full text-black overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50 dark:from-slate-800 dark:via-gray-800/50 dark:to-slate-900 backdrop-blur-xl hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-indigo-500/5 border-transparent hover:border-primary/30">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary to-secondary p-8 pb-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
                    <div className="relative flex items-start gap-6">
                      <div className="w-20 h-20 text-black bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl text-black font-bold drop-shadow-lg">
                          {getInitials(student?.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl text-black font-bold leading-tight">{student?.name || 'Unknown Student'}</h3>
                        <p className="text-black text-lg opacity-90">{student?.email || 'No email'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/30 dark:to-teal-900/30 border backdrop-blur-sm">
                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Company</p>
                        <p className="font-bold text-lg text-gray-900">{student?.internship?.companyName || "N/A"}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 border backdrop-blur-sm">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Position</p>
                        <p className="font-bold text-lg text-gray-900">{student?.internship?.role || student?.internship?.position || "N/A"}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/80 to-violet-50/80 dark:from-purple-900/30 dark:to-violet-900/30 border backdrop-blur-sm">
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Duration</p>
                        <p className="font-bold text-lg text-gray-900">{formatDuration(student?.internship?.startDate, student?.internship?.endDate)}</p>
                      </div>
                    </div>

                    {/* Status & Progress */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg text-gray-800">Status</span>
                        <Badge status={student?.internship?.status || "pending"} />
                      </div>
                      <ProgressBar value={75} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Overall Progress</span>
                        <span className="font-semibold text-emerald-600">75%</span>
                      </div>
                    </div>

                    {/* Late Submissions & Actions */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {(student?.lateSubs || 0) > 0 && (
                        <Badge status="rejected" className="!bg-red-100/80 !text-red-900 !border-red-200">
                          {(student?.lateSubs || 0)} late submission{(student?.lateSubs || 0) > 1 ? 's' : ''}
                        </Badge>
                      )}
                      <div className="ml-auto">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTab(activeTab === student?._id ? null : student?._id)}
                          className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white bg-blue-800 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 text-sm"
                        >
                        {activeTab === student?._id ? "Close Details" : "View Details"}
                        </motion.button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {activeTab === student?._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-6 border-t border-gray-200/50 space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-semibold text-primary text-sm uppercase tracking-wide mb-2">Phone</p>
                              <p className="text-gray-800">{student?.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-primary text-sm uppercase tracking-wide mb-2">Department</p>
                              <p className="text-gray-800">{student?.department || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-800">
                            Last activity: {student.lastSubmission ? new Date(student.lastSubmission).toLocaleDateString() : 'No recent activity'}
                          </div>
                          <div className="flex gap-3 pt-4">
                            <motion.button whileHover={{ scale: 1.01 }} className="flex-1 bg-emerald-500/90 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all">
                              Review Reports
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.01 }} className="flex-1 bg-orange-500/90 hover:bg-orange-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all">
                              Assign Task
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Admin Notices */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Notice Board
          </h3>
          {notices.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {notices.map((notice) => (
                <motion.div
                  key={notice._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
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
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {notice.message}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    From: {notice.sender?.name || 'Admin'}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
            >
              <div className="text-5xl mb-4 opacity-50">📢</div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No notices yet</h4>
              <p className="text-gray-600 dark:text-gray-400">Important announcements will appear here.</p>
            </motion.div>
          )}
        </motion.section>
      </motion.section>
    </div>
  );
};

export default MentorDashboard;

