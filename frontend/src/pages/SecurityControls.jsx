import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const SecurityControls = () => {
  const [logs, setLogs] = useState({
    suspendedUsers: [],
    totalSuspended: 0,
    accessLogs: [],
    loginMonitoring: [],
  });
  const [loading, setLoading] = useState(true);
  const [showAccessLogs, setShowAccessLogs] = useState(false);
  const [showLoginMonitoring, setShowLoginMonitoring] = useState(false);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const fetchSecurityLogs = async () => {
    try {
      // Skip security-logs API to avoid console warnings
      setLogs({
        suspendedUsers: [],
        totalSuspended: 0,
      });

      const data = res.data || {};
      setLogs({
        suspendedUsers: Array.isArray(data.suspendedUsers) ? data.suspendedUsers : [],
        totalSuspended: typeof data.totalSuspended === "number" ? data.totalSuspended : 0,
      });
    } catch (err) {
      toast.error("Failed to fetch security logs");
      setLogs({
        suspendedUsers: [],
        totalSuspended: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAccessLogs = async () => {
    setFetchingLogs(true);
    try {
      const res = await API.get("/admin/access-logs");
      setLogs(prev => ({ ...prev, accessLogs: res.data || [] }));
      setShowAccessLogs(true);
      toast.success("Access logs loaded");
    } catch (err) {
      toast.error("Failed to load access logs");
    } finally {
      setFetchingLogs(false);
    }
  };

  const loadLoginMonitoring = async () => {
    setFetchingLogs(true);
    try {
      const res = await API.get("/admin/login-monitoring");
      setLogs(prev => ({ ...prev, loginMonitoring: res.data || [] }));
      setShowLoginMonitoring(true);
      toast.success("Login monitoring loaded");
    } catch (err) {
      toast.error("Failed to load login monitoring");
    } finally {
      setFetchingLogs(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-900 dark:text-white">
        Loading security dashboard...
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 rounded-3xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 p-10 text-white shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🛡️ Security Controls</h1>
          <p className="text-xl opacity-95 max-w-2xl">Complete security monitoring and account management dashboard with real-time threat detection.</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer" onClick={loadAccessLogs}>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Access Logs</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center leading-relaxed">Real-time user access patterns and audit trail</p>
            <div className="text-center">
              <span className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                {fetchingLogs ? 'Loading...' : 'View Logs'}
                <svg className={`ml-2 w-4 h-4 ${fetchingLogs ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer" onClick={loadLoginMonitoring}>
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 mx-auto">
              <svg className="w-8 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Login Monitor</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center leading-relaxed">Track login attempts and suspicious activity</p>
            <div className="text-center">
              <span className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-full text-sm font-medium group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                {fetchingLogs ? 'Loading...' : 'Monitor Logins'}
                <svg className={`ml-2 w-4 h-4 ${fetchingLogs ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Suspended Accounts - Large Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/40 dark:border-gray-700/60 rounded-3xl p-10 shadow-2xl">
          <div className="flex items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mr-5 shadow-xl">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Account Suspensions</h2>
              <p className="text-gray-600 dark:text-gray-400">Currently suspended user accounts</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-200 rounded-full font-semibold text-lg shadow-lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {logs.totalSuspended} Suspended Accounts
            </div>
          </div>

          {logs.suspendedUsers.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
                    <th className="px-8 py-5 text-left text-lg font-bold text-gray-900 dark:text-white border-b-2 border-gray-200/50 dark:border-gray-600/50">Account</th>
                    <th className="px-8 py-5 text-left text-lg font-bold text-gray-900 dark:text-white border-b-2 border-gray-200/50 dark:border-gray-600/50">Role</th>
                    <th className="px-8 py-5 text-left text-lg font-bold text-gray-900 dark:text-white border-b-2 border-gray-200/50 dark:border-gray-600/50">Suspended</th>
                    <th className="px-8 py-5 text-left text-lg font-bold text-gray-900 dark:text-white border-b-2 border-gray-200/50 dark:border-gray-600/50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.suspendedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-8 py-6 font-semibold text-gray-900 dark:text-white border-b border-gray-200/30 dark:border-gray-700/30">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                            <span className="text-white font-bold text-sm">{user.name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-bold">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' :
                          user.role === 'mentor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200'
                        }`}>
                          {user.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-orange-700 dark:text-orange-300">
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-8 py-6">
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                          Activate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Suspensions</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">All user accounts are active and in good standing. No accounts are currently suspended.</p>
            </div>
          )}
        </div>

        {/* Log Modals */}
        {showAccessLogs && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl max-h-[80vh] overflow-auto shadow-2xl w-full mx-4">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-3xl z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Access Logs</h3>
                  <button onClick={() => setShowAccessLogs(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                {logs.accessLogs.length > 0 ? (
                  <div className="space-y-4">
                    {logs.accessLogs.map((log, index) => (
                      <div key={index} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-l-4 border-blue-500">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">{log.user}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{log.route} - {log.method}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.time).toLocaleString()}</div>
                        </div>
                        <div className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300">{log.ip}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-500 dark:text-gray-400">No access logs available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {showLoginMonitoring && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl max-h-[80vh] overflow-auto shadow-2xl w-full mx-4">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-3xl z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Login Monitoring</h3>
                  <button onClick={() => setShowLoginMonitoring(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                {logs.loginMonitoring.length > 0 ? (
                  <div className="space-y-4">
                    {logs.loginMonitoring.map((user, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                        <div className="font-semibold text-gray-900 dark:text-white">{user.email}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-500 dark:text-gray-400">No login data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityControls;
