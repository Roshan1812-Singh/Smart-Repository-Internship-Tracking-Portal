import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { fileUrl } from "../config";
import Badge from "../components/ui/Badge";
import HeroHeader from "../components/ui/HeroHeader";
import DataTable from "../components/ui/DataTable";
import ProgressBar from "../components/ui/ProgressBar";
import {
  getMyApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  uploadProof,
} from "../services/internshipService";

const MyApplications = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    domain: "",
    projectTitle: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await getMyApplications();
      setInternships(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching internships:", error);
      toast.error("Failed to load applications");
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const refresh = () => fetchInternships();

  const handleDelete = async (id) => {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    try {
      await deleteApplication(id);
      toast.success("Application deleted successfully!");
      refresh();
    } catch (error) {
      toast.error(
        "Delete failed: " + (error.response?.data?.message || error.message),
      );
    }
  };

  const openEdit = (app = null) => {
    if (app) {
      setFormData(app);
      setIsEditMode(true);
      setEditingId(app._id);
    } else {
      setFormData({
        companyName: "",
        role: "",
        domain: "",
        projectTitle: "",
        startDate: "",
        endDate: "",
        notes: "",
      });
      setIsEditMode(false);
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditMode && editingId) {
        await updateApplication(formData);
        toast.success("Application updated!");
      } else {
        const submitData = { ...formData, appliedOn: new Date() };
        await createApplication(submitData);
        toast.success("Application submitted successfully!");
      }
      setShowModal(false);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProofChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const handleProofUpload = async () => {
    if (!proofFile || !selectedApp?._id) return;
    setUploadingProof(true);
    try {
      await uploadProof(selectedApp._id, proofFile);
      toast.success("Proof of application uploaded!");
      refresh();
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploadingProof(false);
      setShowProofModal(false);
      setProofFile(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  const tableColumns = [
    { key: "companyName", label: "Company", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "domain", label: "Domain" },
    {
      key: "appliedOn",
      label: "Applied",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "N/A"),
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <Badge status={val || "PENDING"} />,
    },
    {
      key: "progress",
      label: "Progress",
      render: (val) => (
        <div className="w-20">
          <ProgressBar value={val || 0} />
          <span className="text-xs text-gray-500 block">{val || 0}%</span>
        </div>
      ),
    },
    {
      key: "proofOfApplication",
      label: "Proof",
      render: (val) =>
        val?.url ? (
          <span className="text-green-600 font-bold text-lg">✅</span>
        ) : (
          <span className="text-red-600 font-bold text-lg">❌</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedApp(row);
              setShowViewModal(true);
            }}
            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
            title="View details"
          >
            👁️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
            className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded transition-colors"
            title="Update"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <HeroHeader
            title="My Applications"
            subtitle="Track your internship applications with real-time progress and document status."
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refresh}
            className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            🔄 Refresh List
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Your Applications ({internships.length})
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openEdit()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              ➕ New Application
            </motion.button>
          </div>

          {internships.length === 0 ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-20 bg-white/50 dark:bg-gray-900/50 rounded-3xl backdrop-blur-xl border border-gray-200/50"
            >
              <div className="text-6xl mb-6 mx-auto">📄</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Applications
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your internship journey by creating your first
                application.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openEdit()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl"
              >
                ➕ Create First Application
              </motion.button>
            </motion.div>
          ) : (
            <DataTable
              columns={tableColumns}
              data={internships}
              searchPlaceholder="Search your applications by company or role..."
            />
          )}
        </motion.div>

        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 max-w-2xl w-full max-h-[90vh] overflow-auto rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-t-3xl text-white">
                <h2 className="text-2xl font-bold">
                  {isEditMode ? "Update Application" : "New Application"}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
                    placeholder="e.g., Google"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <input
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
                    placeholder="e.g., Software Engineering Intern"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain
                    </label>
                    <input
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
                      placeholder="e.g., Web Development"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title
                    </label>
                    <input
                      name="projectTitle"
                      value={formData.projectTitle}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
                      placeholder="e.g., Full Stack Development"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 resize-vertical"
                    placeholder="Any additional notes about the application..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 px-6 rounded-2xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 px-6 rounded-2xl font-bold shadow-xl transition-all disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : isEditMode
                        ? "Update"
                        : "Submit Application"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showViewModal && selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 max-w-4xl w-full max-h-[90vh] overflow-auto rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl text-white">
                <h2 className="text-2xl font-bold">Application Details</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2">Company</h3>
                    <p className="text-2xl font-semibold">
                      {selectedApp.companyName}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Role</h3>
                    <p className="text-xl">{selectedApp.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                    <h4 className="font-semibold mb-1">Status</h4>
                    <Badge status={selectedApp.status} className="text-lg" />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                    <h4 className="font-semibold mb-1">Applied</h4>
                    <p>
                      {selectedApp.appliedOn
                        ? new Date(selectedApp.appliedOn).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                    <h4 className="font-semibold mb-1">Progress</h4>
                    <div className="w-full">
                      <ProgressBar value={selectedApp.progress || 0} />
                      <p className="text-sm text-gray-600 mt-1">
                        {(selectedApp.progress || 0).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
                {selectedApp.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl border-l-4 border-blue-500">
                      {selectedApp.notes}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-4">Proof of Application</h4>
                  {selectedApp.documents?.proofOfApplication?.url ? (
                    <div className="flex gap-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-200">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="font-semibold">Uploaded</p>
                        <a
                          href={fileUrl(selectedApp.documents.proofOfApplication.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Proof
                        </a>
                        {selectedApp.documents.proofOfApplication.verified && (
                          <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setShowProofModal(true)}
                      className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all"
                    >
                      📎 Upload Proof
                    </motion.button>
                  )}
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-2xl font-medium transition-colors"
                  >
                    Close
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setShowViewModal(false);
                      openEdit(selectedApp);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-2xl font-bold transition-all"
                  >
                    Edit Application
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showProofModal && selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProofModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Upload Proof of Application
              </h3>
              <p className="text-gray-600 mb-6">
                Upload screenshot/email proof that you sent the application
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleProofChange}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl mb-4 focus:border-blue-500 transition-colors"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProofUpload}
                  disabled={!proofFile || uploadingProof}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {uploadingProof ? "Uploading..." : "Upload Proof"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 m-auto mt-20 max-w-2xl mx-4 rounded-3xl shadow-2xl max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-t-3xl text-white">
                <h2 className="text-2xl font-bold">
                  {isEditMode ? "✏️ Update Application" : "➕ New Application"}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Company Name"
                  className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  placeholder="Role"
                  className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    placeholder="Domain"
                    className="p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    placeholder="Project Title"
                    className="p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes..."
                  rows="3"
                  className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 resize-vertical"
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-400 text-white py-3 rounded-xl hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 font-bold shadow-lg"
                  >
                    {submitting
                      ? "Saving..."
                      : isEditMode
                        ? "Update"
                        : "Submit"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
