import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";
import Card from "../components/ui/Card";

const AssignedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedStudentForTask, setSelectedStudentForTask] = useState(null);
  
  const [taskForm, setTaskForm] = useState({ taskTitle: '', description: '', deadline: '' });
  const [bulkMessage, setBulkMessage] = useState('');
  const [selectedReportStudentId, setSelectedReportStudentId] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get("/mentor/assigned-students");
        setStudents(res.data.students || []);
      } catch (err) {
        console.error("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Student Name',
      sortable: true,
      render: (name, row) => (
        <div className="font-semibold hover:text-primary transition-colors cursor-pointer text-shadow-white">
          {name}
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'internship.companyName',
      label: 'Company',
      sortable: true,
      render: (_, row) => row.internship?.companyName || 'N/A'
    },
    {
      key: 'internship.role',
      label: 'Position',
      sortable: true,
      render: (_, row) => row.internship?.role || row.internship?.position || 'N/A'
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true
    },
    {
      key: 'internship.status',
      label: 'Status',
      sortable: true,
      render: (_, row) => (
        <Badge status={row.internship?.status || 'pending'} />
      )
    },
    {
      key: 'lateSubs',
      label: 'Late Subs',
      sortable: true,
      render: (lateSubs) => (
        <Badge 
          status={lateSubs > 0 ? 'rejected' : 'approved'}
          className={`${
            lateSubs > 0 ? '!bg-red-100 !text-red-800' : '!bg-emerald-100 !text-emerald-800'
          }`}
        >
          {lateSubs}
        </Badge>
      )
    },
    {
      key: 'progress',
      label: 'Progress',
      sortable: true,
      render: (_, row) => (
        <div className="w-24">
          <div className="flex items-center gap-1 mb-1 text-xs">
            <span>80%</span>
          </div>
          <ProgressBar value={80} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>
      )
    }
  ];

  const handleRowClick = (student) => {
    setSelectedStudent(student);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-900 space-y-12">
      <HeroHeader 
        title="Assigned Students" 
        subtitle="Comprehensive view of all your interns with company details, progress tracking, and quick actions."
      />

      <DataTable 
        columns={columns} 
        data={students}
        onRowClick={handleRowClick}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 p-8 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-200/50 dark:border-emerald-800/50 rounded-3xl backdrop-blur-xl"
      >
        <div className="flex-1">
          <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">Quick Actions</h3>
          <p className="text-emerald-700 dark:text-emerald-300">Manage your interns efficiently</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            onClick={() => setShowAssignModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300"
          >
            Assign New Task
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            onClick={() => setShowBulkModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
          >
            Bulk Message
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            onClick={() => setShowReportModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300"
          >
            Generate Report
          </motion.button>
        </div>
      </motion.div>

      {showReportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4"
          onClick={() => setShowReportModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50 dark:border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-red-50/50 dark:from-orange-900/50 dark:to-red-900/50 backdrop-blur-sm border-b border-orange-200/50 dark:border-orange-800/50 p-8 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Generate Report
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-3 rounded-2xl bg-white/50 hover:bg-white/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 backdrop-blur-sm shadow-lg transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Student for Report
                </label>
                <select 
                  value={selectedReportStudentId}
                  onChange={(e) => setSelectedReportStudentId(e.target.value)}
                  className="w-full p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} - {student.department} - {student.internship?.companyName || 'No Internship'}
                    </option>
                  ))}
                </select>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (!selectedReportStudentId) {
                    alert('Please select a student');
                    return;
                  }
                  
                  try {
                    const response = await API.get(`/mentor/student-report/${selectedReportStudentId}`);
                    const reportData = response.data;
                    
                    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `report-${reportData.student.name.replace(/\\s+/g, '_')}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    alert('Report generated and downloaded successfully!');
                    setShowReportModal(false);
                    setSelectedReportStudentId('');
                  } catch (error) {
                    alert('Error generating report: ' + (error.response?.data?.message || error.message));
                  }
                }}
                disabled={!selectedReportStudentId}
                className="w-full p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📊 Generate Complete Report
              </motion.button>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4 border-t border-gray-200/50 dark:border-gray-700/50">
                Report includes internship details, all tasks, submissions, evaluations, and performance summary
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showBulkModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4"
          onClick={() => setShowBulkModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50 dark:border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-900/50 dark:to-indigo-900/50 backdrop-blur-sm border-b border-blue-200/50 dark:border-blue-800/50 p-8 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Bulk Message
                </h2>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="p-3 rounded-2xl bg-white/50 hover:bg-white/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 backdrop-blur-sm shadow-lg transition-all"
                >
                  ✕
                </button>
              </div>
              <p className="text-blue-700 dark:text-blue-300 mt-2 text-sm">
                Message will be sent to all {students.length} assigned students
              </p>
            </div>
            <div className="p-8 space-y-6">
              <textarea
                rows="6"
                placeholder="Type your message here...&#10;This will be visible to all your students."
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                className="w-full p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-vertical text-lg"
              />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (!bulkMessage.trim()) {
                    alert('Please enter a message');
                    return;
                  }
                  
                  try {
                    await API.post('/mentor/bulk-message', { message: bulkMessage });
                    alert('Bulk message sent successfully!');
                    setShowBulkModal(false);
                    setBulkMessage('');
                  } catch (error) {
                    alert('Error sending message: ' + (error.response?.data?.message || error.message));
                  }
                }}
                className="w-full p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              >
                Send to All Students ({students.length})
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showAssignModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4"
          onClick={() => setShowAssignModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50 dark:border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-900/50 dark:to-teal-900/50 backdrop-blur-sm border-b border-emerald-200/50 dark:border-emerald-800/50 p-8 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Assign New Task
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-3 rounded-2xl bg-white/50 hover:bg-white/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 backdrop-blur-sm shadow-lg transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Student
                </label>
                <select 
                  value={selectedStudentForTask?._id || ''}
                  onChange={(e) => setSelectedStudentForTask(students.find(s => s._id === e.target.value))}
                  className="w-full p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} - {student.internship?.companyName || 'No Company'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Submit Week 1 Report"
                  value={taskForm.taskTitle}
                  onChange={(e) => setTaskForm({...taskForm, taskTitle: e.target.value})}
                  className="w-full p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Detailed instructions, requirements, deliverables..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                  className="w-full p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (!selectedStudentForTask || !taskForm.taskTitle.trim()) {
                    alert('Please select a student and enter task title');
                    return;
                  }
                  
                  try {
                    await API.post('/mentor/assign-task', {
                      studentId: selectedStudentForTask._id,
                      ...taskForm
                    });
                    alert('Task assigned successfully!');
                    setShowAssignModal(false);
                    setTaskForm({ taskTitle: '', description: '', deadline: '' });
                    setSelectedStudentForTask(null);
                  } catch (error) {
                    alert('Error assigning task: ' + (error.response?.data?.message || error.message));
                  }
                }}
                className="w-full p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300"
              >
                Assign Task
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {selectedStudent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white/50 dark:from-gray-900/50 dark:to-black/50 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 p-8 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent text-white">
                  {selectedStudent.name}
                </h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-xl bg-gray-200/50 hover:bg-gray-300/50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card>
                  <h3 className="font-bold text-lg mb-3 text-black">Company & Position</h3>
                  <p className="text-2xl font-bold text-gray-900">{selectedStudent.internship?.companyName}</p>
                  <p className="text-lg text-gray-600">{selectedStudent.internship?.role}</p>
                </Card>
                <Card>
                  <h3 className="font-bold text-lg mb-3 text-black">Progress</h3>
                  <ProgressBar value={80} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <p className="text-lg font-bold text-emerald-600 mt-2">80%</p>
                </Card>
                <Card cla>
                  <h3 className="font-bold text-lg mb-3 text-black">Status</h3>
                  <Badge status={selectedStudent.internship?.status} className="!text-lg !px-6 !py-3 bg-gray-600" />
                </Card>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AssignedStudents;

