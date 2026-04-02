import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import Timeline from "../components/ui/Timeline";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";

const ReportReview = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get("/mentor/reports");
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const reviewReport = async (action) => {
    if (!feedback.trim()) {
      alert("Please add feedback");
      return;
    }

    setReviewLoading(true);
    try {
      await API.put(`/reports/${selectedReport._id}/review`, { 
        mentorReview: feedback, 
        action 
      });
      
      setReports(reports.map(r => 
        r._id === selectedReport._id 
          ? { ...r, mentorReview: feedback, status: action, reviewedAt: new Date() }
          : r
      ));
      
      setSelectedReport(null);
      setFeedback("");
    } catch (err) {
      console.error("Failed to review report", err);
      alert(err.response?.data?.message || "Review failed");
    } finally {
      setReviewLoading(false);
    }
  };

  const viewReportDocument = (document) => {
    if (document && document.path) {
      window.open('http://localhost:5000' + document.path, '_blank');
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-50 via-rose-50/50 to-indigo-100 dark:from-gray-900 dark:via-rose-900/20 dark:to-indigo-900/20">
      <HeroHeader 
        title="Report Review" 
        subtitle="Review your students' weekly reports, provide feedback, and track submission history."
      />

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <motion.div
              key={report._id}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group"
            >
              <Card className="h-full cursor-pointer hover:shadow-1xl transition-all duration-500 relative overflow-hidden bg-gray-500">
                <div className="p-8 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        📊
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary transition-colors">
                          Week {new Date(report.date).getWeekNumber()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <Badge 
                      status={report.status === 'approved' ? 'approved' : report.status === 'rejected' ? 'rejected' : 'pending'}
                      className={`text-sm px-4 py-2 font-bold shadow-md ${
                        report.status === 'reviewed' ? '!bg-gray-100 !text-gray-700 !border-gray-300 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-700 w-20">Tasks:</span>
                        <span className="text-gray-900">{report.tasksCompleted}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-700 w-20">Tech:</span>
                        <span className="text-gray-900">{report.technologiesUsed}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-700 w-20">Hours:</span>
                        <span className="text-gray-900">{report.hoursWorked}h</span>
                      </div>
                    </div>
                    
                    {report.problemsFaced && (
                      <div className="p-4 bg-rose-50/80 dark:bg-rose-900/30 rounded-2xl border border-rose-200/50 dark:border-rose-800/50">
                        <p className="font-medium text-rose-800 dark:text-black text-sm">
                          ⚠️ {report.problemsFaced}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-200/50">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={report.status === 'reviewed'}
                      onClick={() => report.status !== 'reviewed' && setSelectedReport(report)}
                      className={`w-full py-4 px-6 rounded-2xl font-bold shadow-lg transition-all duration-300 text-sm uppercase tracking-wide ${
                        report.status === 'reviewed' 
                          ? 'bg-indigo-300 text-gray-100 cursor-not-allowed shadow-none' 
                          : 'bg-blue-500 text-white hover:from-blue-700 hover:to-indigo-600 shadow-xl hover:shadow-2xl'
                      }`}
                    >
                      {report.status === 'reviewed' ? '✅ Reviewed' : 'Review Report'}
                    </motion.button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-rose-500 to-orange-500 text-white p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                    📊
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Review Report</h2>
                    <p className="opacity-90">{selectedReport.student?.name}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setSelectedReport(null)}
                    className="ml-auto p-3 bg-red-400 backdrop-blur-sm rounded-2xl hover:bg-red-600 transition-all"
                  >
                    ✕
                  </motion.button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-2xl mb-6 text-gray-300">Report Details</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Tasks Completed</label>
                        <p className="text-2xl font-mono text-white">{selectedReport.tasksCompleted}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Technologies Used</label>
                        <p className="text-xl">{selectedReport.technologiesUsed}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Hours Worked Ascent of the Lord</label>
                        <p className="text-3xl font-bold text-primary">{selectedReport.hoursWorked}h</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-white">
                    <h3 className="font-bold text-2xl mb-6 text-white">Timeline</h3>
                    <Timeline 
                    className="text-white"
                      items={[
                        {
                          title: 'Submitted by Student',
                          description: `Report for ${new Date(selectedReport.date).toLocaleDateString()}`,
                          status: 'pending',
                          date: selectedReport.createdAt,
                          icon: '📤'
                        },
                        ...(selectedReport.mentorReview ? [{
                          title: 'Your Review',
                          description: selectedReport.mentorReview,
                          status: selectedReport.status || 'pending',
                          date: selectedReport.reviewedAt,
                          icon: '✅'
                        }] : [])
                      ]}
                    />
                  </div>
                </div>

                {/* New Student Submitted Report Section */}
                {selectedReport.document && (
                  <Card className="bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-900/30 border-indigo-200/50 p-8">
                    <h3 className="font-bold text-2xl mb-6 text-gray-900 flex items-center gap-3">
                      <span>📄</span> Student Submitted Report
                    </h3>
                    <div className="space-y-4 mb-6">
                      <p className="text-lg text-gray-700">
                        <span className="font-semibold">Filename:</span> {selectedReport.document.filename}
                      </p>
                      <p className="text-lg text-gray-700">
                        <span className="font-semibold">Size:</span> {formatFileSize(selectedReport.document.size)}
                      </p>
                      <p className="text-lg text-gray-700">
                        <span className="font-semibold">Type:</span> {selectedReport.document.mimeType}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => viewReportDocument(selectedReport.document)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 uppercase tracking-wide flex items-center justify-center gap-3"
                    >
                      <span>📖</span> View Submitted Report PDF
                    </motion.button>
                  </Card>
                )}

                {selectedReport.problemsFaced && (
                  <Card className="bg-gradient-to-r from-rose-50/80 to-pink-50/80 dark:from-rose-900/30 border-rose-200/50 p-6">
                    <h4 className="font-bold text-xl text-rose-900 mb-4 flex items-center gap-2">
                      <span>⚠️</span> Challenges Faced
                    </h4>
                    <p className="text-lg text-rose-800 leading-relaxed">{selectedReport.problemsFaced}</p>
                  </Card>
                )}

                <div>
                  <h3 className="font-bold text-2xl mb-6 text-gray-900">Your Feedback</h3>
                  <div className="space-y-4">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide detailed feedback for your student. Be specific about what's working well and areas for improvement..."
                      rows={6}
                      className="w-full p-6 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 resize-none transition-all bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-lg placeholder-gray-500"
                    />
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={reviewLoading}
                        onClick={() => reviewReport('approve')}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 uppercase tracking-wide flex items-center justify-center gap-3"
                      >
                        <span>✅</span>
                        {reviewLoading ? 'Processing...' : 'Approve Report'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={reviewLoading}
                        onClick={() => reviewReport('reject')}
                        className="flex-1 bg-gradient-to-r from-rose-500 to-orange-600 text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-rose-600 hover:to-orange-700 transition-all duration-300 uppercase tracking-wide flex items-center justify-center gap-3"
                      >
                        <span>❌</span>
                        {reviewLoading ? 'Processing...' : 'Reject & Feedback'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Date.prototype.getWeekNumber = function() {
  const date = new Date(this);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export default ReportReview;
