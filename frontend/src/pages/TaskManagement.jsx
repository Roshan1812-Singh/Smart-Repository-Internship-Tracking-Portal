import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import KanbanBoard from "../components/ui/KanbanBoard";
import CalendarPicker from "../components/ui/CalendarPicker";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import DataTable from "../components/ui/DataTable";

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [newTask, setNewTask] = useState({
    studentId: "",
    taskTitle: "",
    description: "",
    deadline: "",
    priority: "medium"
  });
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' or 'list' or 'calendar'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, tasksRes] = await Promise.all([
        API.get("/mentor/assigned-students"),
        API.get("/mentor/tasks")
      ]);
      setStudents(studentsRes.data.students || []);
      setTasks(tasksRes.data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const assignTask = async () => {
    if (!newTask.studentId || !newTask.taskTitle || !newTask.deadline) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await API.post("/progress/add", newTask);
      setNewTask({
        studentId: "",
        taskTitle: "",
        description: "",
        deadline: "",
        priority: "medium"
      });
      fetchData(); // Refresh
    } catch (err) {
      console.error("Failed to assign task");
      alert("Failed to assign task");
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/progress/${taskId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error("Failed to update task");
    }
  };

  const taskTableColumns = [
    { key: 'taskTitle', label: 'Task Title', sortable: true },
    { key: 'student.name', label: 'Student', sortable: true, render: (_, row) => row.student?.name },
    { key: 'status', label: 'Status', sortable: true, render: (status) => <Badge status={status} /> },
    { key: 'deadline', label: 'Deadline', sortable: true, render: (deadline) => 
      deadline ? new Date(deadline).toLocaleDateString() : 'No deadline' },
    { key: 'priority', label: 'Priority', render: (priority) => (
      <Badge 
        status={priority} 
        className={`!bg-${priority === 'high' ? 'rose' : priority === 'medium' ? 'amber' : 'emerald'}-100 !text-${priority === 'high' ? 'rose' : priority === 'medium' ? 'amber' : 'emerald'}-800`}
      />
    )}
  ];

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
    <div className="min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900/50 dark:to-emerald-900/20 space-y-12">
      <HeroHeader 
        title="Task Management" 
        subtitle="Assign tasks, track progress with live kanban board, and manage deadlines with calendar integration."
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setActiveTab('kanban')}
          className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${
            activeTab === 'kanban' 
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-xl' 
              : 'text-gray-700 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          📊 Kanban Board
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${
            activeTab === 'list' 
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-xl' 
              : 'text-gray-700 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          📋 Task List
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${
            activeTab === 'calendar' 
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-xl' 
              : 'text-gray-700 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          📅 Calendar
        </motion.button>
      </div>

      {/* Assign New Task Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-400 text-black backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gray-600 to-gray-400 bg-clip-text text-black">
          ➕ Assign New Task
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">Student</label>
              <select
                value={newTask.studentId}
                onChange={(e) => {
                  const student = students.find(s => s._id === e.target.value);
                  setNewTask({ ...newTask, 
                    studentId: e.target.value,
                    studentName: student?.name
                  });
                }}
                className="w-full p-5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all bg-white/50 dark:bg-gray-800/50 shadow-lg"
              >
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} - {s.internship?.companyName || 'No company'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Implement user authentication"
                value={newTask.taskTitle}
                onChange={(e) => setNewTask({ ...newTask, taskTitle: e.target.value })}
                className="w-full p-5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all bg-white/50 dark:bg-gray-800/50 shadow-lg text-lg"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-900 mb-3">Description</label>
              <textarea
                placeholder="Detailed task description, acceptance criteria, resources..."
                rows={4}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all bg-white/50 dark:bg-gray-800/50 shadow-lg resize-vertical"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">Deadline</label>
              <CalendarPicker
                value={newTask.deadline}
                onChange={(date) => setNewTask({ ...newTask, deadline: date })}
                className="bg-gray-200 text-white" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">Priority</label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'medium', 'high'].map(priority => (
                  <motion.button
                    key={priority}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNewTask({ ...newTask, priority })}
                    className={`p-4 rounded-xl font-bold transition-all shadow-lg ${
                      newTask.priority === priority
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-2xl scale-105 ring-4 ring-rose-200/50'
                        : priority === 'low' ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300 border-2'
                        : priority === 'medium' ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 border-2'
                        : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300 border-2'
                    }`}
                  >
                    {priority.toUpperCase()}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={assignTask}
              className="w-full col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 px-8 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 uppercase tracking-wide flex items-center justify-center gap-3"
            >
              <span>🚀</span>
              Assign Task
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {activeTab === 'kanban' && (
          <KanbanBoard tasks={tasks} onDragEnd={updateTaskStatus} />
        )}
        
        {activeTab === 'list' && (
          <DataTable 
            columns={taskTableColumns}
            data={tasks}
            searchPlaceholder="Search tasks by title or student..."
          />
        )}
        
        {activeTab === 'calendar' && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-4">Calendar view coming soon</h3>
            <p className="text-xl text-gray-600 max-w-lg mx-auto">Visual calendar integration with drag & drop deadlines will be available here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;

