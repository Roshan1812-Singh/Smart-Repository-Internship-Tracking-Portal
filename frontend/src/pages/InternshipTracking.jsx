import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { fileUrl } from "../config";

const InternshipTracking = () => {
  const [internships, setInternships] = useState([]);
  const [inactive, setInactive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [iRes, inactiveRes] = await Promise.all([
        API.get("/admin/internships"),
        API.get("/admin/inactive-students"),
      ]);

      setInternships(iRes.data || []);
      setInactive(inactiveRes.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: "bg-green-500 text-white",
      pending: "bg-yellow-500 text-white",
      rejected: "bg-red-500 text-white",
      completed: "bg-blue-500 text-white",
      active: "bg-indigo-500 text-white",
    };
    return colors[status] || "bg-gray-500 text-white";
  };

  if (loading) {
    return <div className="p-6 text-center">Loading internships...</div>;
  }

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Internship Tracking Dashboard
        </h1>
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          Active Internships ({internships.length})
          <span className="ml-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
            All Students
          </span>
        </h2>
        {internships.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-2xl p-8">
            <div className="text-4xl mb-4 opacity-50">📊</div>
            <p className="text-xl text-gray-400 mb-2">No internships found</p>
            <p className="text-gray-500">Students need to apply first</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => (
              <div
                key={internship._id}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl hover:border-blue-500 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 line-clamp-1">
                      {internship.companyName || "Unnamed Company"}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {internship.role ||
                        internship.domain ||
                        "Internship Role"}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(internship.status)}`}
                      >
                        {internship.status}
                      </span>
                      {internship.startDate && (
                        <span className="text-xs text-gray-400">
                          {new Date(internship.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center text-sm font-bold shadow-lg ml-4 flex-shrink-0">
                    {internship.mentor?.name?.[0] || "?"}
                  </span>
                </div>

                <div className="mb-4 p-3 bg-gray-800/50 rounded-xl">
                  <h4 className="font-semibold text-sm mb-2">Student</h4>
                  <div>
                    <div className="font-medium">
                      {internship.student?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {internship.student?.email}
                    </div>
                    {internship.student?.department && (
                      <div className="text-xs text-gray-400">
                        {internship.student.department} |{" "}
                        {internship.student.year || "N/A"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
                  {internship.student?.resume && (
                    <a
                      href={fileUrl(internship.student.resume)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-green-500/80 hover:bg-green-600 text-xs rounded-lg text-white transition-colors flex items-center gap-1"
                    >
                      📄 Resume
                    </a>
                  )}
                  <Link
                    to={`/admin/students/${internship.student?._id}`}
                    className="px-3 py-1 bg-blue-500/80 hover:bg-blue-600 text-xs rounded-lg text-white transition-colors"
                  >
                    👤 Profile
                  </Link>
                  <Link
                    to={`/admin/documents`}
                    className="px-3 py-1 bg-indigo-500/80 hover:bg-indigo-600 text-xs rounded-lg text-white transition-colors"
                  >
                    📋 Documents
                  </Link>
                  <Link
                    to={`/admin/reports`}
                    className="px-3 py-1 bg-purple-500/80 hover:bg-purple-600 text-xs rounded-lg text-white transition-colors"
                  >
                    📊 Reports
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">
          ⚠️ Inactive Students ({inactive.length})
        </h2>
        {inactive.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-2xl p-8">
            <div className="text-4xl mb-4 text-green-400">✅</div>
            <p className="text-xl text-gray-400">All students active!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {inactive.map((student, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-l-4 border-orange-500 p-5 rounded-lg hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">
                      {student.student?.name || "Student"}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <span>
                        Last update:{" "}
                        {new Date(student.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                        Alert
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/admin/students/${student.student?._id}`}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipTracking;
