import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const DataBackup = () => {
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState([]);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await API.get("/admin/export-data", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `database-export.json`);
      document.body.appendChild(link);
      link.click();
      toast.success("Database exported successfully");
    } catch (err) {
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleExportReports = async () => {
    setExporting(true);
    try {
      toast("Export Reports feature ready - mock download");
      setExporting(false);
    } catch (err) {
      toast.error("Failed to export reports");
    } finally {
      setExporting(false);
    }
  };

  const loadBackupHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/backup-history");
      setBackupHistory(res.data);
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-10 text-white shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Data & Backup Center
          </h1>
          <p className="text-xl opacity-90">
            Comprehensive database management and backup solutions for system
            administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4m-8 10V5"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Database Export
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Generate complete database backup including all users, reports,
              and system data.
            </p>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="group/btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {exporting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Exporting Database...
                </>
              ) : (
                "📦 Export Database Now"
              )}
            </button>
          </div>

          <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Export Reports
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Download consolidated reports and analytics data in JSON format.
            </p>
            <button
              onClick={handleExportReports}
              disabled={exporting}
              className="group/btn bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {exporting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Exporting Reports...
                </>
              ) : (
                "📊 Export Reports"
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 col-span-full lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                System Logs
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              View detailed system activity logs and audit trail.
            </p>
            <button
              onClick={() =>
                toast.success("System logs view - Backend API ready")
              }
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 w-full"
            >
              📋 View System Logs
            </button>
          </div>

          <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 col-span-full lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Backup History
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Review previous backups and restore from history.
            </p>
            <button
              onClick={loadBackupHistory}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 w-full"
            >
              {loading ? "Loading..." : "📜 View History"}
            </button>
            {backupHistory.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <h4 className="font-semibold mb-2">Recent Backups:</h4>
                <ul className="space-y-1 text-sm">
                  {backupHistory.slice(0, 3).map((backup) => (
                    <li key={backup.id} className="flex justify-between">
                      {new Date(backup.date).toLocaleDateString()} -{" "}
                      {backup.size}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${backup.status === "Success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {backup.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataBackup;
