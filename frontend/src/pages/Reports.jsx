import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import { submitReport } from "../services/studentService.js";
import HeroHeader from "../components/ui/HeroHeader";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import DataTable from "../components/ui/DataTable";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [newReport, setNewReport] = useState({
    date: "",
    tasksCompleted: "",
    technologiesUsed: "",
    hoursWorked: "",
    problemsFaced: "",
  });
  const [reportFile, setReportFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        setAllReports(res.data.reports);
        const now = new Date();
        const filtered = res.data.reports.filter((report) => {
          const isReviewed =
            report.mentorReview && report.mentorReview !== "pending";
          const isOld =
            report.createdAt && now - new Date(report.createdAt) > ONE_WEEK;
          return !isReviewed && !isOld;
        });
        setReports(filtered);
      } catch (err) {
        console.error("Failed to fetch reports");
      }
    };
    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportFile) {
      alert("Please select a PDF report file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("date", newReport.date);
      formData.append("tasksCompleted", newReport.tasksCompleted);
      formData.append("technologiesUsed", newReport.technologiesUsed);
      formData.append("hoursWorked", newReport.hoursWorked);
      formData.append("problemsFaced", newReport.problemsFaced);
      formData.append("document", reportFile);

      await submitReport(formData);
      setNewReport({
        date: "",
        tasksCompleted: "",
        technologiesUsed: "",
        hoursWorked: "",
        problemsFaced: "",
      });
      setReportFile(null);
      const res = await API.get("/reports");
      setAllReports(res.data.reports);
      const now = new Date();
      const filtered = res.data.reports.filter((report) => {
        const isReviewed =
          report.mentorReview && report.mentorReview !== "pending";
        const isOld =
          report.createdAt && now - new Date(report.createdAt) > ONE_WEEK;
        return !isReviewed && !isOld;
      });
      setReports(filtered);
      alert("Report submitted successfully with PDF!");
    } catch (err) {
      console.error("Failed to submit report", err);
      alert(
        "Submission failed: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setUploading(false);
    }
  };

  const reportTableColumns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { key: "tasksCompleted", label: "Tasks Completed", sortable: true },
    { key: "hoursWorked", label: "Hours", sortable: true },
    {
      key: "mentorReview",
      label: "Status",
      render: (review) => (
        <Badge
          status={review === "approved" ? "completed" : review || "pending"}
        />
      ),
    },
  ];

  return (
    <div className="bg-gradient-to-br from-orange-50 via-rose-50 to-violet-100 dark:from-gray-900 dark:via-slate-900/50 dark:to-violet-900/20">
      <div className="max-w-6xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-black"
        >
          <HeroHeader
            title="📊 Daily / Weekly Reports"
            subtitle="Submit your progress reports and track mentor feedback. Only pending reports shown."
            className=""
          />
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="backdrop-blur-xl shadow-2xl border-white/40 p-2">
            <div className="p-10">
              <h2 className="text-3xl font-black mb-10 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent text-center">
                ➕ Submit New Report
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="md:col-span-1 space-y-2">
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-black flex items-center gap-2">
                    📅 Date
                  </label>
                  <input
                    type="date"
                    value={newReport.date}
                    onChange={(e) =>
                      setNewReport({ ...newReport, date: e.target.value })
                    }
                    className="w-full p-5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white/50 dark:bg-gray-800/50 shadow-lg text-lg"
                    required
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-black flex items-center gap-2">
                    ⏱️ Hours Worked
                  </label>
                  <input
                    type="number"
                    placeholder="8"
                    value={newReport.hoursWorked}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        hoursWorked: e.target.value,
                      })
                    }
                    className="w-full p-5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white/50 dark:bg-gray-800/50 shadow-lg text-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-black flex items-center gap-2">
                    ✅ Tasks Completed Today
                  </label>
                  <textarea
                    rows={4}
                    placeholder="• Implemented user authentication module
• Fixed UI bugs in dashboard
• Wrote unit tests for API endpoints..."
                    value={newReport.tasksCompleted}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        tasksCompleted: e.target.value,
                      })
                    }
                    className="w-full p-5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white/50 dark:bg-gray-800/50 shadow-lg resize-vertical text-lg"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-black flex items-center gap-2">
                    ⚙️ Technologies Used
                  </label>
                  <input
                    type="text"
                    placeholder="React, Tailwind CSS, Node.js, MongoDB"
                    value={newReport.technologiesUsed}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        technologiesUsed: e.target.value,
                      })
                    }
                    className="w-full p-5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white/50 dark:bg-gray-800/50 shadow-lg text-lg"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-black flex items-center gap-2">
                    🚧 Challenges Faced
                  </label>
                  <textarea
                    rows={4}
                    placeholder="• CORS issues with API integration
• Performance optimization needed
• Learning curve with new library..."
                    value={newReport.problemsFaced}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        problemsFaced: e.target.value,
                      })
                    }
                    className="w-full p-5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white/50 dark:bg-gray-800/50 shadow-lg resize-vertical text-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-black flex items-center gap-2">
                    📄 Report PDF File (Required)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setReportFile(e.target.files[0])}
                    className="w-full p-5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white/50 dark:bg-gray-800/50 shadow-lg text-lg file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-lg file:font-semibold file:bg-gradient-to-r file:from-emerald-500 file:to-teal-600 file:text-white hover:file:from-emerald-600 hover:file:to-teal-700"
                    required
                  />
                  {reportFile && (
                    <p className="text-sm text-emerald-600 mt-2 flex items-center gap-2">
                      ✅ Selected: {reportFile.name} (
                      {(reportFile.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={uploading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {uploading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 bg-gray-400 rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <div className="text-xl cursor-pointer m-1 p-3 rounded-2xl text-gray-800 bg-blue-500 border-2 border-gray-800 hover:bg-blue-700 hover:text-white">📤 Submit Report with PDF</div>
                  )}
                </motion.button>
              </form>
            </div>
          </Card>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center p-8 backdrop-blur-xl shadow-xl group hover:shadow-2xl">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {reports.length}
              </div>
              <div className="text-lg font-bold text-emerald-600 uppercase tracking-wide">
                Pending Review
              </div>
            </Card>
            <Card className="text-center p-8 backdrop-blur-xl shadow-xl group hover:shadow-2xl">
              <div className="text-4xl mb-4">✅</div>
              <div className="text-3xl font-black text-emerald-600">
                {allReports.filter((r) => r.mentorReview === "approved").length}
              </div>
              <div className="text-lg font-bold text-emerald-600 uppercase tracking-wide">
                Approved
              </div>
            </Card>
            <Card className="text-center p-8 backdrop-blur-xl shadow-xl group hover:shadow-2xl">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-3xl font-black text-rose-600">
                {allReports.filter((r) => r.mentorReview === "rejected").length}
              </div>
              <div className="text-lg font-bold text-rose-600 uppercase tracking-wide">
                Needs Revision
              </div>
            </Card>
            <Card className="text-center p-8 backdrop-blur-xl shadow-xl group hover:shadow-2xl">
              <div className="text-4xl mb-4">📈</div>
              <div className="text-3xl font-black text-blue-600">
                {Math.round(
                  (allReports.filter((r) => r.mentorReview === "approved")
                    .length /
                    allReports.length) *
                    100,
                ) || 0}
                %
              </div>
              <div className="text-lg font-bold text-blue-600 uppercase tracking-wide">
                Approval Rate
              </div>
            </Card>
          </div>

          <Card className="backdrop-blur-xl shadow-2xl p-2">
            <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-3xl font-black mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                📋 Recent Reports ({reports.length})
              </h3>
            </div>
            <DataTable
              columns={reportTableColumns}
              data={reports}
              searchPlaceholder="Search reports..."
            />
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default Reports;
