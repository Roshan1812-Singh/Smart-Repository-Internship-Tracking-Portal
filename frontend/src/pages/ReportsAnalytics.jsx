import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const ReportsAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/reports/analytics");
      setAnalytics(res.data.analytics);
    } catch (err) {
      toast.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return <div className="p-6 text-center">No data available</div>;

  // Completion pie data
  const completionPieData = [
    { name: 'Completed', value: analytics.totalInternships > 0 ? (analytics.completionRate || 0) : 0, fill: '#10B981' },
    { name: 'Pending', value: analytics.totalInternships - (analytics.completionRate || 0), fill: '#F59E0B' }
  ];

  // Report status bar data
  const reportBarData = (analytics.reportStats || []).map(stat => ({
    name: stat._id || 'Unknown',
    count: stat.count,
    fill: '#3B82F6'
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Reports & Analytics Dashboard
        </h1>
        <button
          onClick={fetchAnalytics}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl shadow-lg transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="text-2xl font-bold">{analytics.completionRate || 0}%</div>
          <div className="text-sm opacity-90">Completion Rate</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="text-2xl font-bold">{analytics.totalInternships || 0}</div>
          <div className="text-sm opacity-90">Total Internships</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="text-2xl font-bold">{(analytics.evaluationAverages?.avgOverall || 0).toFixed(1)}</div>
          <div className="text-sm opacity-90">Avg Eval Score</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="text-2xl font-bold">{analytics.evaluationAverages?.totalEvals || 0}</div>
          <div className="text-sm opacity-90">Total Evaluations</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Completion Rate Pie */}
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Internship Completion Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={completionPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {completionPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Evaluation Scores Bar */}
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Evaluation Category Averages</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[analytics.evaluationAverages || {}]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={false} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgTechnical" fill="#3B82F6" name="Technical" />
              <Bar dataKey="avgCommunication" fill="#10B981" name="Communication" />
              <Bar dataKey="avgProblemSolving" fill="#F59E0B" name="Problem Solving" />
              <Bar dataKey="avgWorkEthics" fill="#EF4444" name="Work Ethics" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Report Status */}
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Report Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">🏆 Top 5 Students</h2>
          <div className="space-y-4">
            {(analytics.topStudents || []).map((student, idx) => (
              <div key={student._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl border">
                <div>
                  <div className="font-semibold">{student.student?.name}</div>
                  <div className="text-sm text-purple-100">{student.student?.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-100">{student.avgScore?.toFixed(1)}</div>
                  <div className="text-xs opacity-75">Avg Score</div>
                </div>
              </div>
            ))}
            {(!analytics.topStudents || analytics.topStudents.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No evaluations yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;

