import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalMentors: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/system-dashboard");
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  const userName = user?.name || "Super Admin";

  return (
    <div className="p-6">
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Welcome, {userName}</h1>
        <p className="text-lg max-w-2xl">
          Manage the entire SRITP platform from a single dashboard. Monitor system activity, control user roles, and ensure secure operations across the portal.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-sm">All roles</span>
          </div>
          <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-300">{stats.totalUsers}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Users</h3>
            <span className="rounded-full bg-green-50 text-green-700 px-3 py-1 text-sm">Live</span>
          </div>
          <p className="text-4xl font-bold text-green-600 dark:text-green-300">{stats.activeUsers}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Super Admins</h3>
            <span className="rounded-full bg-red-50 text-red-700 px-3 py-1 text-sm">Primary</span>
          </div>
          <p className="text-4xl font-bold text-red-600 dark:text-red-300">{stats.totalSuperAdmins}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Admins</h3>
            <span className="rounded-full bg-purple-50 text-purple-700 px-3 py-1 text-sm">Manage</span>
          </div>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-300">{stats.totalAdmins}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Mentors</h3>
            <span className="rounded-full bg-yellow-50 text-yellow-700 px-3 py-1 text-sm">Guide</span>
          </div>
          <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-300">{stats.totalMentors}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Students</h3>
            <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm">Learning</span>
          </div>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-300">{stats.totalStudents}</p>
        </div>
      </div>

      {/* Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/superadmin/admin-management"
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold mb-2">Admin Management</h3>
          <p className="text-gray-600 dark:text-gray-300">Add/remove admins and control their roles.</p>
        </Link>
        <Link
          to="/superadmin/permission-management"
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold mb-2">Permission & Role Management</h3>
          <p className="text-gray-600 dark:text-gray-300">Define access levels and role hierarchy.</p>
        </Link>
        <Link
          to="/superadmin/user-management"
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold mb-2">User Management</h3>
          <p className="text-gray-600 dark:text-gray-300">Manage all users: students, mentors, and admins.</p>
        </Link>
        <Link
          to="/superadmin/system-config"
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold mb-2">System Configuration</h3>
          <p className="text-gray-600 dark:text-gray-300">Customize internship rules and system behavior.</p>
        </Link>
        <Link
          to="/superadmin/data-backup"
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold mb-2">Data & Backup</h3>
          <p className="text-gray-600 dark:text-gray-300">Export important data and logs.</p>
        </Link>
        <Link
          to="/superadmin/security-controls"
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold mb-2">Security Controls</h3>
          <p className="text-gray-600 dark:text-gray-300">Monitor security and manage suspensions.</p>
        </Link>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;