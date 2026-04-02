import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const SystemConfiguration = () => {
  const [config, setConfig] = useState({
    internshipRules: {
      maxDuration: 6,
      minDuration: 1,
      requiredDocuments: [],
    },
    reportFrequency: {
      daily: true,
      weekly: true,
      monthly: false,
    },
    evaluationCriteria: {
      technicalSkills: 40,
      communication: 20,
      teamwork: 20,
      punctuality: 20,
    },
    systemSettings: {
      maintenanceMode: false,
      allowRegistration: true,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await API.get("/admin/system-config");
      setConfig(res.data);
    } catch (err) {
      toast.error("Failed to fetch config");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      await API.put("/admin/system-config", config);
      toast.success("Configuration updated");
    } catch (err) {
      toast.error("Failed to update config");
    }
  };

  const handleChange = (section, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-r from-indigo-500 to-blue-500 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Loading Configuration</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">Preparing system settings dashboard...</p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center p-6 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-3xl shadow-2xl mb-8 backdrop-blur-xl">
            <svg className="w-12 h-12 text-white mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">System Control Center</h1>
              <p className="text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed">Master configuration panel for internship platform settings and evaluation criteria</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Internship Rules */}
          <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50 dark:border-gray-700/60 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-5 shadow-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Internship Rules</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xl font-bold text-gray-900 dark:text-white mb-2 block">Maximum Duration</span>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={config.internshipRules.maxDuration}
                      onChange={(e) => handleChange("internshipRules", "maxDuration", parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg cursor-pointer appearance-none accent-indigo-600 hover:accent-indigo-500 transition-all"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span>1 Month</span>
                      <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">{config.internshipRules.maxDuration} Months</span>
                      <span>12 Months</span>
                    </div>
                  </div>
                </label>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xl font-bold text-gray-900 dark:text-white mb-2 block">Minimum Duration</span>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={config.internshipRules.minDuration}
                      onChange={(e) => handleChange("internshipRules", "minDuration", parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg cursor-pointer appearance-none accent-indigo-600 hover:accent-indigo-500 transition-all"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span>1 Month</span>
                      <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">{config.internshipRules.minDuration} Months</span>
                      <span>6 Months</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Report Frequency */}
          <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50 dark:border-gray-700/60 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 col-span-full">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-5 shadow-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Report Cadence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { key: 'daily', label: 'Daily Reports', icon: '📅', color: 'from-orange-500 to-red-500' },
                { key: 'weekly', label: 'Weekly Reports', icon: '📊', color: 'from-emerald-500 to-teal-500' },
                { key: 'monthly', label: 'Monthly Reports', icon: '📈', color: 'from-purple-500 to-pink-500' }
              ].map(({ key, label, icon, color }) => (
                <label key={key} className="relative flex items-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border-2 border-gray-200/50 dark:border-gray-600/50 hover:border-indigo-300/50 cursor-pointer group hover:shadow-xl transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={config.reportFrequency[key]}
                    onChange={(e) => handleChange("reportFrequency", key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-6 h-6 rounded-xl flex items-center justify-center mr-4 shadow-md flex-shrink-0 transition-all duration-300 ${config.reportFrequency[key] ? `bg-gradient-to-r ${color} shadow-${color.split(' ')[0].replace('from-', '')}-300/50 scale-110` : 'bg-gray-200 dark:bg-gray-600 shadow-gray-300/50'}`}>
                    {config.reportFrequency[key] ? '✓' : ''}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-xl text-gray-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{icon} {label}</div>
                    <div className={`text-sm font-semibold px-3 py-1 rounded-xl transition-all ${config.reportFrequency[key] ? 'bg-white/60 shadow-md shadow-indigo-200/50' : 'text-gray-600 dark:text-gray-400'}`}>
                      {config.reportFrequency[key] ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Evaluation Criteria */}
          <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50 dark:border-gray-700/60 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500">
            <div className="flex items-center mb-10">
              <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mr-5 shadow-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Evaluation Matrix</h2>
            </div>
            <div className="space-y-8">
              {[
                { key: 'technicalSkills', label: 'Technical Skills', color: 'from-blue-500 to-indigo-500', icon: '💻' },
                { key: 'communication', label: 'Communication', color: 'from-emerald-500 to-teal-500', icon: '🗣️' },
                { key: 'teamwork', label: 'Teamwork', color: 'from-orange-500 to-amber-500', icon: '🤝' },
                { key: 'punctuality', label: 'Punctuality', color: 'from-purple-500 to-violet-500', icon: '⏰' }
              ].map(({ key, label, color, icon }) => (
                <div key={key} className="group">
                  <label className="block">
                    <div className="flex items-center mb-4">
                      <span className={`text-3xl mr-4 ${config.evaluationCriteria[key] === 40 ? 'animate-pulse' : ''}`}>{icon}</span>
                      <div className="font-black text-2xl text-gray-900 dark:text-white">{label}</div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={config.evaluationCriteria[key]}
                        onChange={(e) => handleChange("evaluationCriteria", key, parseInt(e.target.value))}
                        className="w-full h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg cursor-pointer appearance-none accent-indigo-600 hover:accent-indigo-500 shadow-lg hover:shadow-xl transition-all"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">0%</span>
                        <span className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg px-4 py-2">
                          {config.evaluationCriteria[key]}%
                        </span>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">100%</span>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-12 pt-12 border-t-2 border-gray-200/50 dark:border-gray-700/60 text-center">
              <div className="text-6xl font-black text-gray-900 dark:text-white mb-4">100%</div>
              <p className="text-xl text-gray-600 dark:text-gray-400">Total Weight ✓</p>
            </div>
          </div>

          {/* System Settings */}
          <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50 dark:border-gray-700/60 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 col-span-full">
            <div className="flex items-center mb-10">
              <div className="w-14 h-14 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl flex items-center justify-center mr-5 shadow-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Global Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  key: 'maintenanceMode',
                  label: 'Maintenance Mode',
                  description: 'Temporarily disable user access for updates',
                  icon: '🔧',
                  color: 'from-orange-400 to-red-400'
                },
                {
                  key: 'allowRegistration',
                  label: 'Allow Registration',
                  description: 'Enable/disable new user signups',
                  icon: '🚪',
                  color: 'from-emerald-400 to-teal-400'
                }
              ].map(({ key, label, description, icon, color }) => (
                <label key={key} className="relative flex items-start space-x-4 p-6 rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/60 hover:border-indigo-400/60 cursor-pointer group bg-gradient-to-r from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 hover:shadow-xl transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={config.systemSettings[key]}
                    onChange={(e) => handleChange("systemSettings", key, e.target.checked)}
                    className="mt-1 w-6 h-6 text-indigo-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-indigo-500 focus:ring-2 cursor-pointer peer transition-all"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">{icon}</span>
                      <div className="font-black text-2xl text-gray-900 dark:text-white">{label}</div>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
                    <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      config.systemSettings[key] 
                        ? `bg-gradient-to-r ${color} text-white shadow-lg shadow-[${color.split(' ')[0].replace('from-', '')}-300/50]` 
                        : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-400 shadow-sm'
                    }`}>
                      {config.systemSettings[key] ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleUpdateConfig}
            className="inline-flex items-center px-12 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 group"
          >
            💾 Save All Changes
            <svg className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;