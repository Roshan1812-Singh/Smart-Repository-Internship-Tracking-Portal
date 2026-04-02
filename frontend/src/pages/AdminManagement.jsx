import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "admin" });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await API.get("/admin/all-admins");
      setAdmins(res.data);
    } catch (err) {
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/admins", formData);
      toast.success("Admin added");
      setShowAddForm(false);
      setFormData({ name: "", email: "", password: "", role: "admin" });
      fetchAdmins();
    } catch (err) {
      toast.error("Failed to add admin");
    }
  };

  const handleRemoveAdmin = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await API.delete(`/admin/admins/${id}`);
        toast.success("Admin removed");
        fetchAdmins();
      } catch (err) {
        toast.error("Failed to remove admin");
      }
    }
  };

  const handleUpdatePermissions = async (id, permissions) => {
    try {
      await API.put(`/admin/permissions/${id}`, { permissions });
      toast.success("Permissions updated");
      fetchAdmins();
    } catch (err) {
      toast.error("Failed to update permissions");
    }
  };

if (loading) return (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
  </div>
);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-10 text-white shadow-2xl">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6 shadow-2xl">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">Admin Management</h1>
              <p className="text-xl opacity-90">Complete control over admin accounts and granular permission management</p>
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl text-sm font-semibold">
              {admins.length} Active Admins
            </span>
          </div>
        </div>

        {/* Add Admin Form */}
        <div className="mb-12">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-gray-700/50">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {showAddForm ? "Create New Admin" : "Add New Admin"}
              </h2>
            </div>

            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 w-full md:w-auto"
              >
                ➕ Create New Admin Account
              </button>
            ) : (
              <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter admin name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                  <input
                    type="email"
                    placeholder="admin@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    placeholder="Secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div className="md:col-span-1 flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300"
                  >
                    ✅ Create Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ name: "", email: "", password: "", role: "admin" });
                    }}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Admin Table */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/50 overflow-hidden">
          <div className="p-8 border-b border-white/30 dark:border-gray-700/50">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Admin Accounts Overview</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage permissions and security for all admin users</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 backdrop-blur-sm">
                  <th className="px-8 py-6 text-left text-lg font-bold text-gray-900 dark:text-white border-b-2 border-gray-200/50 dark:border-gray-600/50">Admin</th>
                  <th className="px-8 py-6 text-left text-lg font-bold text-gray-900 dark:text-white border-b-2 border-gray-200/50 dark:border-gray-600/50">Role</th>
                  <th className="px-8 py-6 text-left text-lg font-bold text-gray-900 dark:text-white border-b-2 border-gray-200/50 dark:border-gray-600/50">Permissions</th>
                  <th className="px-8 py-6 text-left text-lg font-bold text-gray-900 dark:text-white border-b-2 border-gray-200/50 dark:border-gray-600/50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {admins.map((admin, index) => {
                  const perms = admin.permissions || {};
                  return (
                    <tr key={admin._id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/50 dark:bg-gray-800/30' : ''}`}>
                      <td className="px-8 py-8">
                        <div className="flex items-center">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 shadow-lg text-white font-bold text-lg flex-shrink-0 ${
                            admin.role === 'superadmin' 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                              : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                          }`}>
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-xl text-gray-900 dark:text-white">{admin.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <span className={`inline-flex items-center px-4 py-2 rounded-2xl font-bold text-sm uppercase tracking-wide shadow-md ${
                          admin.role === 'superadmin' 
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' 
                            : 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200'
                        }`}>
                          {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <label className="w-44 text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">Manage Admins:</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={perms.canManageAdmins || false}
                                onChange={(e) => {
                                  const newPerms = { ...perms, canManageAdmins: e.target.checked };
                                  handleUpdatePermissions(admin._id, newPerms);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                          <div className="flex items-center">
                            <label className="w-44 text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">Manage Users:</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={perms.canManageUsers || false}
                                onChange={(e) => {
                                  const newPerms = { ...perms, canManageUsers: e.target.checked };
                                  handleUpdatePermissions(admin._id, newPerms);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                          <div className="flex items-center">
                            <label className="w-44 text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">View Reports:</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={perms.canViewReports || false}
                                onChange={(e) => {
                                  const newPerms = { ...perms, canViewReports: e.target.checked };
                                  handleUpdatePermissions(admin._id, newPerms);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                          <div className="flex items-center">
                            <label className="w-44 text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">System Config:</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={perms.canConfigureSystem || false}
                                onChange={(e) => {
                                  const newPerms = { ...perms, canConfigureSystem: e.target.checked };
                                  handleUpdatePermissions(admin._id, newPerms);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleRemoveAdmin(admin._id)}
                            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;