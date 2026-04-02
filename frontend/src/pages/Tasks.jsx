import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import API from "../api/axios";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [submissionLinks, setSubmissionLinks] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/progress/student");
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks");
        toast.error("Failed to load tasks");
      }
    };
    fetchTasks();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/progress/${id}`, { status });
      setTasks(tasks.map(task => task._id === id ? { ...task, status } : task));
      toast.success("Status updated!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const updateSubmissionLink = (id, link) => {
    setSubmissionLinks(prev => ({
      ...prev,
      [id]: link
    }));
  };

  const submitTask = async (id) => {
    const link = submissionLinks[id];
    if (!link) {
      toast.error("Please enter a submission link");
      return;
    }
    try {
      await API.put(`/progress/${id}`, { submissionLink: link });
      setTasks(tasks.map(task => task._id === id ? { ...task, submissionLink: link } : task));
      toast.success("Submission submitted!");
    } catch (err) {
      toast.error("Failed to submit");
    }
  };

  const refreshTasks = async () => {
    try {
      const res = await API.get("/progress/student");
      setTasks(res.data);
      setSubmissionLinks({});
    } catch (err) {
      toast.error("Failed to refresh tasks");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <button
          onClick={refreshTasks}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow p-8">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-xl mb-2">No tasks assigned yet</p>
            <p className="text-gray-400">Your mentor will assign tasks here. Check back soon!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task._id} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{task.taskTitle}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{task.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {task.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
              </p>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(task._id, 'in-progress')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                    disabled={task.status === 'completed'}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateStatus(task._id, 'completed')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Mark Completed
                  </button>
                </div>
                {task.status === 'completed' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Submission link (GitHub, Netlify, etc.)"
                      value={submissionLinks[task._id] || task.submissionLink || ""}
                      onChange={(e) => updateSubmissionLink(task._id, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => submitTask(task._id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition font-medium"
                      disabled={!submissionLinks[task._id]}
                    >
                      Submit
                    </button>
                  </div>
                )}
                {task.submissionLink && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Submitted:</span>
                    <a 
                      href={task.submissionLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 font-medium truncate max-w-xs"
                    >
                      {task.submissionLink}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;

