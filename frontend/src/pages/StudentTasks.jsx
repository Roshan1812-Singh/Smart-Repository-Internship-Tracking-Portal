import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";
import Card from "../components/ui/Card";
import DataTable from "../components/ui/DataTable";
import KanbanBoard from "../components/ui/KanbanBoard";
import * as studentService from "../services/studentService";
import { useState } from "react"; 

const StudentTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await API.get("/students/tasks");
      setTasks(res.data.tasks || res.data);
    } catch (err) {
      console.error(err);
    }
  }; 

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reportForm, setReportForm] = useState({
    tasksCompleted: '',
    technologiesUsed: '',
    hoursWorked: '',
    problemsFaced: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const taskTableColumns = [
    { key: 'taskTitle', label: 'Task Title', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (status) => <Badge status={status} /> },
    { key: 'deadline', label: 'Deadline', sortable: true, render: (deadline) => 
      deadline ? new Date(deadline).toLocaleDateString() : 'No deadline' },
    { key: 'priority', label: 'Priority', render: (priority) => (
      <Badge 
        status={priority} 
        className={`!bg-${priority === 'high' ? 'rose' : priority === 'medium' ? 'amber' : 'emerald'}-100 !text-${priority === 'high' ? 'rose' : priority === 'medium' ? 'amber' : 'emerald'}-800`}
      />
    )},
    { key: 'progressPercentage', label: 'Progress', render: (progress) => (
      <ProgressBar value={progress || 0} size="sm" color="from-blue-500 to-indigo-600" />
    )},
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={() => {
              setSelectedTask(row);
              setShowReportModal(true);
            }}
          >
            Submit Report
          </motion.button>
        </div>
      )
    }
  ];

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('date', reportForm.date);
    formData.append('tasksCompleted', reportForm.tasksCompleted);
    formData.append('technologiesUsed', reportForm.technologiesUsed);
    formData.append('hoursWorked', reportForm.hoursWorked);
    formData.append('problemsFaced', reportForm.problemsFaced);
    formData.append('taskId', selectedTask._id);
    if (fileInputRef.current.files[0]) {
      formData.append('document', fileInputRef.current.files[0]);
    }

    try {
      await studentService.submitReport(formData);
      alert('Report submitted successfully!');
      setShowReportModal(false);
      setSelectedTask(null);
      setReportForm({
        tasksCompleted: '',
        technologiesUsed: '',
        hoursWorked: '',
        problemsFaced: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadTasks();
    } catch (error) {
      alert('Failed to submit report: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  }; 

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-orange-50 via-yellow-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900/50 dark:to-orange-900/20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HeroHeader 
            title="Task Management"
            subtitle="View your assigned tasks, update progress, and track deadlines with beautiful kanban and list views."
          />
        </motion.div>

        {/* View Toggle Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/40"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex-1 py-4 px-6 rounded-xl font-bold transition-all bg-gradient-to-r from-primary to-secondary text-white shadow-xl"
          >
            📊 Kanban View
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex-1 py-4 px-6 rounded-xl font-bold transition-all text-gray-700 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            📋 List View
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex-1 py-4 px-6 rounded-xl font-bold transition-all text-gray-700 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            📅 Calendar
          </motion.button>
        </motion.div>

        {/* Tasks Content */}
        <div className="space-y-8">
          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            <Card className="text-center p-6 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Tasks</div>
            </Card>
            <Card className="text-center p-6 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-emerald-600">{tasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-sm font-medium text-emerald-600 uppercase tracking-wide">Completed</div>
            </Card>
            <Card className="text-center p-6 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-bold text-amber-600">{tasks.filter(t => t.status === 'pending').length}</div>
              <div className="text-sm font-medium text-amber-600 uppercase tracking-wide">Pending</div>
            </Card>
            <Card className="text-center p-6 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-2xl font-bold text-rose-600">{tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'completed').length}</div>
              <div className="text-sm font-medium text-rose-600 uppercase tracking-wide">Overdue</div>
            </Card>
          </motion.div>

          {/* Main Content Area */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* Kanban Board */}
            <Card className="backdrop-blur-xl shadow-2xl p-2 h-[600px]">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  📊 Kanban Board
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Drag tasks to update status</p>
              </div>
              <KanbanBoard 
                tasks={tasks || []}
                readOnly={true}
              />
            </Card>

            {/* Tasks List */}
            <Card className="backdrop-blur-xl shadow-2xl p-2 h-[600px]">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  📋 Detailed List
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Complete view with all details</p>
              </div>
              <DataTable 
                columns={taskTableColumns}
                data={tasks}
                searchPlaceholder="Search tasks..."
              />
            </Card>
          </motion.div>

          {/* Report Submission Modal */}
          {showReportModal && selectedTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setShowReportModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/50 p-6 rounded-t-3xl border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">📋 Submit Report for</h2>
                    <button onClick={() => setShowReportModal(false)} className="p-2 rounded-2xl hover:bg-gray-200 transition-colors">✕</button>
                  </div>
                  <h3 className="text-xl font-semibold mt-1">{selectedTask.taskTitle}</h3>
                </div>
                <form onSubmit={handleSubmitReport} className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Date</label>
                    <input type="date" value={reportForm.date} onChange={(e) => setReportForm({...reportForm, date: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tasks Completed</label>
                    <textarea rows="3" value={reportForm.tasksCompleted} onChange={(e) => setReportForm({...reportForm, tasksCompleted: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 resize-vertical" placeholder="Describe what you completed for this task..." required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Technologies Used</label>
                      <input type="text" value={reportForm.technologiesUsed} onChange={(e) => setReportForm({...reportForm, technologiesUsed: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" placeholder="React, Node.js, MongoDB..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Hours Worked</label>
                      <input type="number" value={reportForm.hoursWorked} onChange={(e) => setReportForm({...reportForm, hoursWorked: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" placeholder="8" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Problems Faced (Optional)</label>
                    <textarea rows="2" value={reportForm.problemsFaced} onChange={(e) => setReportForm({...reportForm, problemsFaced: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 resize-vertical" placeholder="Any challenges or blockers..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">📎 Document (Optional PDF/Image)</label>
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200" />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={uploading}
                    whileHover={{ scale: 1.02 }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-8 rounded-3xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all"
                  >
                    {uploading ? '📤 Uploading...' : '📤 Submit Report'}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentTasks; 
