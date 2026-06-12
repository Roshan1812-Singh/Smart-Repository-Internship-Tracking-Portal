import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";

const PermissionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleData, setRoleData] = useState({ permissions: [], allPossiblePermissions: [] });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await API.get("/admin/roles");
      const roleList = res.data || [];
      setRoles(roleList);

      const firstRole = roleList?.[0]?.name || "";
      setSelectedRole(firstRole);
      if (firstRole) {
        await fetchPermissions(firstRole);
      }
    } catch (err) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (roleName) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/roles/${roleName}/permissions`);
      setRoleData(res.data || { permissions: [], allPossiblePermissions: [] });
    } catch (err) {
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    if (role) {
      await fetchPermissions(role);
    }
  };

  const handleTogglePermission = async (perm) => {
    try {
      await API.post(`/admin/roles/${selectedRole}/permissions`, { permission: perm });
      toast.success("Permission updated successfully");
      await fetchPermissions(selectedRole);
    } catch (err) {
      toast.error("Failed to update permission");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading permissions...</p>
        </div>
      </div>
    );
  }

  const isActive = (perm) => roleData.permissions.includes(perm);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-12 text-white shadow-2xl text-center">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-sm">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
            Role & Permission Matrix
          </h1>
          <p className="text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Granular permission control for every role with instant toggle capabilities and comprehensive role management.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <span className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl text-lg font-bold">
              {roles.length} Roles Active
            </span>
            <span className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl text-lg font-bold">
              {roleData.allPossiblePermissions.length} Permissions Available
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl sticky top-8 rounded-3xl p-8 shadow-2xl border border-white/40 dark:border-gray-700/60">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Select Role
              </h3>
              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.name}
                    onClick={() => {
                      setSelectedRole(role.name);
                      fetchPermissions(role.name);
                    }}
                    className={`w-full p-4 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 ${
                      selectedRole === role.name
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl border-2 border-indigo-300/50'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800 dark:hover:to-purple-800'
                    }`}
                  >
                    <div className="font-bold text-lg">{role.name.replace(/^\w/, c => c.toUpperCase())}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40 dark:border-gray-700/60">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                    {selectedRole ? selectedRole.replace(/^\w/, c => c.toUpperCase()) : 'Select a Role'} Permissions
                  </h3>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Toggle permissions below. <span className="font-semibold text-indigo-600 dark:text-indigo-400">{roleData.permissions.length}</span> of <span className="font-semibold text-indigo-600 dark:text-indigo-400">{roleData.allPossiblePermissions.length}</span> active
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-2xl font-bold text-lg shadow-md">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {roleData.permissions.length} Active
                  </span>
                </div>
              </div>

              {roleData.allPossiblePermissions.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <svg className="w-16 h-16 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Permissions Available</h4>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                    This role has no permission configuration available. Please select another role or contact support.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roleData.allPossiblePermissions.map((perm) => {
                    const active = isActive(perm);
                    return (
                      <div key={perm} className="group">
                        <label className="block p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-300/50 dark:hover:border-indigo-600/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                          <div className="flex items-center justify-between mb-4">
                            <div className="font-bold text-lg text-gray-900 dark:text-white capitalize">{perm.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                              active 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-300/50' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 shadow-gray-300/50'
                            }`}>
                              {active ? '✓' : '○'}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <label className="relative inline-flex items-center cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={() => handleTogglePermission(perm)}
                                className="sr-only peer"
                              />
                              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-500"></div>
                            </label>
                            <span className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                              active 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 shadow-md shadow-emerald-200/50' 
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 shadow-sm'
                            }`}>
                              {active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;

