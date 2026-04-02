import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import Badge from "../components/ui/Badge";
import HeroHeader from "../components/ui/HeroHeader";
import Timeline from "../components/ui/Timeline";
import ProgressBar from "../components/ui/ProgressBar";
import Card from "../components/ui/Card";

const InternshipDetails = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingInternship, setEditingInternship] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    companyName: "",
    role: "",
    domain: "",
    projectTitle: "",
    startDate: "",
    endDate: "",
  });
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await API.get("/internship/student");
      setInternships(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch internship details:", err);
      toast.error("Failed to load internship details");
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchInternships();
    toast.success("Refreshed!");
  };

  const handleEdit = (internship) => {
    setEditFormData({
      companyName: internship.companyName || "",
      role: internship.role || internship.domain || "",
      domain: internship.domain || "",
      projectTitle: internship.projectTitle || "",
      startDate: internship.startDate ? new Date(internship.startDate).toISOString().split('T')[0] : "",
      endDate: internship.endDate ? new Date(internship.endDate).toISOString().split('T')[0] : "",
    });
    setEditingInternship(internship._id);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put("/internship/student", editFormData);
      toast.success("Internship details updated!");
      setShowEditModal(false);
      setEditingInternship(null);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="text-lg">Loading your internships...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-slate-900/50 dark:to-emerald-900/20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <HeroHeader 
            title="Internship Details"
            subtitle="Complete view of your internship progress, milestones, mentor, and required documents."
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refresh}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl mt-8 transition-all"
          >
            🔄 Refresh Details
          </motion.button>
        </motion.div>

        {internships.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-24 max-w-2xl mx-auto bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border border-white/50"
          >
            <div className="text-8xl mb-8 mx-auto opacity-40">🏢</div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
              No Active Internships
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-lg mx-auto">
              Your internship details will appear here once approved. Check your applications or contact admin if you believe this is an error.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {internships.map((internship, idx) => (
              <motion.section
                key={internship._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="w-full"
              >
                {/* Main Internship Card */}
                <Card className="backdrop-blur-xl border-white/40 shadow-2xl overflow-hidden group relative ">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5" />
                  <div className="relative z-10 p-10 border-2 bg-gray-400">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8 mb-10 ">
                      <div className="lg:w-1/3 mb-8 lg:mb-0">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl flex-shrink-0">
                            <span className="text-3xl font-bold text-white">🏢</span>
                          </div>
                          <div>
                            <Badge 
                              status={internship.status} 
                              className="px-6 py-3 text-lg font-bold shadow-xl !bg-gradient-to-r from-emerald-500 to-teal-600 !text-white" 
                            />
                          </div>
                        </div>
                        <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4 group-hover:scale-105 transition-transform">
                          {internship.companyName}
                        </h2>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                          {internship.role || internship.domain}
                        </p>
                        {internship.projectTitle && (
                          <p className="text-lg text-gray-600 dark:text-gray-400 italic">
                            "{internship.projectTitle}"
                          </p>
                        )}
                      </div>

                      {/* Key Dates */}
                      <div className="lg:w-2/3 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {internship.startDate && (
                            <div className="text-center p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-200/50">
                              <div className="text-3xl font-bold text-emerald-600 mb-2">📅 Start</div>
                              <div className="text-2xl font-black text-gray-900 dark:text-white">{new Date(internship.startDate).toLocaleDateString()}</div>
                            </div>
                          )}
                          {internship.endDate && (
                            <div className="text-center p-6 bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-2xl border border-rose-200/50">
                              <div className="text-3xl font-bold text-rose-600 mb-2">🏁 End</div>
                              <div className="text-2xl font-black text-gray-900 dark:text-white">{new Date(internship.endDate).toLocaleDateString()}</div>
                            </div>
                          )}
                          {internship.domain && (
                            <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-200/50">
                              <div className="text-3xl font-bold text-blue-600 mb-2">💻 Domain</div>
                              <div className="text-xl font-bold text-gray-900 dark:text-white">{internship.domain}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress & Timeline */}
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
                      <div>
                        <h4 className="text-2xl font-black mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                          Progress Overview
                        </h4>
                        <ProgressBar 
                          value={internship.progress || 0} 
                          label="Overall Progress" 
                          color="from-emerald-500 to-teal-600"
                          size="lg"
                        />
                      </div>
                      <div>
                        {internship.mentor && (
                          <Card className="p-6 mb-6">
                            <h5 className="text-xl font-bold mb-4 flex items-center gap-3">
                              👨‍🏫 Assigned Mentor
                            </h5>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">{internship.mentor.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="font-bold text-xl">{internship.mentor.name}</p>
                                <p className="text-gray-600 dark:text-gray-400">{internship.mentor.email}</p>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      {/* Documents Preview */}
                      <Card className="mb-8 p-8">
                        <h4 className="text-2xl font-black mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
                          📄 Required Documents 
                          <Badge status="info" className="!px-4 !py-1 !text-sm">Preview</Badge>
                        </h4>
                        {internship.documents ? (
                          Object.entries(internship.documents).map(([docType, doc]) => (
                            <div key={docType} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 mb-3 text-black">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 ">
                                <span className="text-black font-bold text-lg">📎</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-lg capitalize">{docType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                  {doc.url ? `Uploaded: ${doc.url.split('/').pop()}` : 'Not uploaded yet'}
                                </div>
                                {doc.verified !== undefined && (
                                  <Badge status={doc.verified ? 'success' : 'warning'} className="!ml-0 !mt-1">
                                    {doc.verified ? '✅ Verified by Mentor' : '⏳ Pending Verification'}
                                  </Badge>
                                )}
                              </div>
                              {doc.url && (
                                <a href={`http://localhost:5000${doc.url}`} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all whitespace-nowrap">
                                  View
                                </a>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic text-center py-8">No documents configured</p>
                        )}
                      </Card>
                      <h4 className="text-2xl font-black mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Key Milestones
                      </h4>
                      <Timeline
                        events={[
                          {
                            title: 'Application Submitted',
                            date: internship.createdAt ? new Date(internship.createdAt).toLocaleDateString() : 'Recent',
                            status: 'pending',
                            description: `Applied to ${internship.companyName}`
                          },
                          ...(internship.startDate ? [{
                            title: 'Internship Started',
                            date: new Date(internship.startDate).toLocaleDateString(),
                            status: internship.status === 'active' ? 'active' : 'completed',
                            description: 'Official start date'
                          }] : []),
                          ...(internship.endDate ? [{
                            title: 'Internship Completion',
                            date: new Date(internship.endDate).toLocaleDateString(),
                            status: 'upcoming',
                            description: 'Expected completion'
                          }] : [])
                        ]}
                      />
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-3 gap-6 mt-12 pt-12 border-t-4 border-gradient-to-r border-emerald-200/50">
                      <motion.button 
                        onClick={() => navigate('/student/tasks')}
                        whileHover={{ scale: 1.05 }}
                        className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-8 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all text-center cursor-pointer"
                      >
                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📋</div>
                        <div>View Tasks</div>
                      </motion.button>
                      <motion.button 
                        onClick={() => navigate('/student/documents')}
                        whileHover={{ scale: 1.05 }}
                        className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all text-center cursor-pointer"
                      >
                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📄</div>
                        <div>Documents</div>
                      </motion.button>
                      <motion.button 
                        onClick={() => navigate('/student/reports')}
                        whileHover={{ scale: 1.05 }}
                        className="group bg-gradient-to-r from-purple-500 to-pink-600 text-white p-8 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all text-center cursor-pointer"
                      >
                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                        <div>Reports</div>
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipDetails;

