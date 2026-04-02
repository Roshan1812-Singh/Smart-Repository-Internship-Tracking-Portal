import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const UserManagement = () => {
  console.log("UserManagement component rendered");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const res = await API.get("/admin/all-users");
      console.log("Users fetched:", res.data);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (id, suspend) => {
    try {
      await API.put(`/admin/suspend/${id}`, { suspend });
      toast.success(`User ${suspend ? "suspended" : "activated"}`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user status");
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await API.put(`/admin/update-role/${id}`, { role: newRole });
      toast.success("User role updated");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user role");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    return user.role === filter;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-12">
          <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-indigo-500 border-t-transparent mb-8 shadow-2xl"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Users...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching user directory
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-10 text-white shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6 shadow-2xl backdrop-blur-sm">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">
                User Directory
              </h1>
              <p className="text-xl opacity-90">
                Complete user lifecycle management with advanced filtering and
                bulk actions
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <span className="inline-flex items-center px-6 py-3 bg-white/30 backdrop-blur-sm rounded-2xl text-lg font-bold">
              {filteredUsers.length} Users{" "}
              {filter !== "all" && (
                <span className="ml-2 text-xs">({filter.toUpperCase()})</span>
              )}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 mb-8 shadow-xl border border-white/40 dark:border-gray-700/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-xl font-bold text-gray-900 dark:text-white">
                Filter by Role:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900 backdrop-blur-sm text-lg font-semibold focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-md hover:shadow-lg"
              >
                <option value="all">All Users ({users.length})</option>
                <option value="student">
                  Students ({users.filter((u) => u.role === "student").length})
                </option>
                <option value="mentor">
                  Mentors ({users.filter((u) => u.role === "mentor").length})
                </option>
                <option value="admin">
                  Admins ({users.filter((u) => u.role === "admin").length})
                </option>
                <option value="superadmin">
                  Super Admins (
                  {users.filter((u) => u.role === "superadmin").length})
                </option>
              </select>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <span>Active: {users.filter((u) => !u.isSuspended).length}</span>
              <span>•</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                Suspended: {users.filter((u) => u.isSuspended).length}

              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 dark:border-gray-700/60">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-800/70 dark:to-slate-700/70 backdrop-blur-sm">
                  <th className="px-8 py-6 text-left text-xl font-black text-gray-900 dark:text-white">
                    User
                  </th>
                  <th className="px-8 py-6 text-left text-xl font-black text-gray-900 dark:text-white">
                    Role
                  </th>
                  <th className="px-8 py-6 text-left text-xl font-black text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-8 py-6 text-left text-xl font-black text-gray-900 dark:text-white">
                    Last Active
                  </th>
                  <th className="px-8 py-6 text-left text-xl font-black text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                          <svg
                            className="w-12 h-12 text-gray-500 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          No users match this filter
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
                          Try adjusting your role filter or there may be no
                          users in this category yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 ${index % 2 ? "bg-white/50 dark:bg-slate-800/30" : ""}`}
                    >
                      <td className="px-8 py-8">
                        <div className="flex items-center">
                          <div
                            className={`w-16 h-16 rounded-3xl flex items-center justify-center mr-6 shadow-xl flex-shrink-0 font-bold text-xl ${
                              user.role === "superadmin"
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : user.role === "admin"
                                  ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                                  : user.role === "mentor"
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                    : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                            }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-2xl text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-lg text-gray-600 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <span
                          className={`inline-flex items-center px-6 py-3 rounded-2xl font-bold text-lg shadow-lg ${
                            user.role === "superadmin"
                              ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200"
                              : user.role === "admin"
                                ? "bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200"
                                : user.role === "mentor"
                                  ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                                  : "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200"
                          }`}
                        >
                          {user.role.replace(/^\w/, (c) => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <span
                          className={`inline-flex items-center px-6 py-3 rounded-2xl font-bold text-lg shadow-lg ${
                            user.isSuspended
                              ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:bg-red-900/60 dark:text-red-200"
                              : "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                          }`}
                        >
                          {user.isSuspended ? "🔒 Suspended" : "✅ Active"}
                        </span>
                      </td>
                      <td className="px-8 py-8 text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {user.updatedAt
                          ? new Date(user.updatedAt).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex gap-3">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleUpdateRole(user._id, e.target.value)
                            }
                            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900 backdrop-blur-sm text-lg font-bold focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 shadow-md hover:shadow-lg transition-all"
                          >
                            <option value="student">Student</option>
                            <option value="mentor">Mentor</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                          <button
                            onClick={() =>
                              handleSuspendUser(user._id, !user.isSuspended)
                            }
                            className={`px-8 py-3 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg flex items-center ${
                              user.isSuspended
                                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                                : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
                            }`}
                          >
                            {user.isSuspended ? (
                              <>
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Activate
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                                  />
                                </svg>
                                Suspend
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="group bg-gradient-to-r from-emerald-500 to-teal-500 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 text-center">
            <div className="text-4xl font-black mb-2">
              {users.filter((u) => !u.isSuspended).length}
            </div>
            <div className="text-lg opacity-90 font-semibold">Active Users</div>
          </div>
          <div className="group bg-gradient-to-r from-red-500 to-rose-500 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 text-center">
            <div className="text-4xl font-black mb-2">
              {users.filter((u) => u.isSuspended).length}

            </div>
            <div className="text-lg opacity-90 font-semibold">Suspended</div>
          </div>
          <div className="group bg-gradient-to-r from-indigo-500 to-blue-500 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 text-center">
            <div className="text-4xl font-black mb-2">
              {users.filter((u) => u.role === "student").length}
            </div>
            <div className="text-lg opacity-90 font-semibold">Students</div>
          </div>
          <div className="group bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-3xl text-white shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 text-center">
            <div className="text-4xl font-black mb-2">
              {
                users.filter(
                  (u) =>
                    u.role === "mentor" ||
                    u.role === "admin" ||
                    u.role === "superadmin",
                ).length
              }
            </div>
            <div className="text-lg opacity-90 font-semibold">Staff</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
