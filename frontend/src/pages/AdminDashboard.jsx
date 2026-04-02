import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    activeInternships: 0,
    completedInternships: 0,
    pendingEvaluations: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetchStats();
    const user = JSON.parse(localStorage.getItem("user"));
    setUserRole(user?.role || "");
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/dashboard");
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="p-6 space-y-10">
      {/* Title */}
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-500 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Students</h3>
          <p className="text-2xl">{stats.totalStudents}</p>
        </div>

        <div className="bg-green-500 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Mentors</h3>
          <p className="text-2xl">{stats.totalMentors}</p>
        </div>

        <div className="bg-yellow-500 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Active Internships</h3>
          <p className="text-2xl">{stats.activeInternships}</p>
        </div>

        <div className="bg-purple-500 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Completed Internships</h3>
          <p className="text-2xl">{stats.completedInternships}</p>
        </div>

        <div className="bg-red-300 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Pending Evaluations</h3>
          <p className="text-2xl">{stats.pendingEvaluations}</p>
        </div>
      </div>

      {/* Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/admin/students"
          className="bg-gray-500 p-4 rounded-lg shadow hover:shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-2">Student Management</h3>
          <p>Manage students, assign mentors, view progress</p>
        </Link>

        <Link
          to="/admin/mentors"
          className="bg-gray-500 p-4 rounded-lg shadow hover:shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-2">Mentor Management</h3>
          <p>Add/edit mentors, assign students</p>
        </Link>

        <Link
          to="/admin/internships"
          className="bg-gray-500 p-4 rounded-lg shadow hover:shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-2">Internship Tracking</h3>
          <p>Monitor progress and internships</p>
        </Link>

        <Link
          to="/admin/reports"
          className="bg-gray-500 p-4 rounded-lg shadow hover:shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-2">Reports & Analytics</h3>
          <p>View completion rates and performance</p>
        </Link>

        <Link
          to="/admin/notifications"
          className="bg-gray-500 p-4 rounded-lg shadow hover:shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-2">Notifications</h3>
          <p>Send announcements and reminders</p>
        </Link>

        <Link
          to="/admin/documents"
          className="bg-gray-500 p-4 rounded-lg shadow hover:shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-2">Document Verification</h3>
          <p>Verify internship documents</p>
        </Link>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-gray-500 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Status Distribution</h3>

          <div className="space-y-4">
            {/* Approved */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Approved</span>
                <span>
                  {stats.total
                    ? ((stats.approved / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${stats.total ? (stats.approved / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Pending */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Pending</span>
                <span>
                  {stats.total
                    ? ((stats.pending / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Rejected */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Rejected</span>
                <span>
                  {stats.total
                    ? ((stats.rejected / stats.total) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${stats.total ? (stats.rejected / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-500 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Quick Stats</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-400 p-4 rounded-lg">
              <p className="text-sm mb-1">Total Internships</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>

            <div className="bg-green-400 p-4 rounded-lg">
              <p className="text-sm mb-1">Success Rate</p>
              <p className="text-2xl font-bold">
                {stats.total
                  ? ((stats.approved / stats.total) * 100).toFixed(0)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
