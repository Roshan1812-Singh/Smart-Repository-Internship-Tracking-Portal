import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import toast from "react-hot-toast";
import HeroHeader from "../components/ui/HeroHeader";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

const Documents = () => {
  const [internship, setInternship] = useState(null);
  const [files, setFiles] = useState({
    offerLetter: null,
    completionCertificate: null,
    finalReport: null,
  });
  const [loading, setLoading] = useState(false);
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchInternship();
  }, []);

  const fetchInternship = async () => {
    try {
      const res = await API.get("/internship/student");
      setInternship(res.data?.[0] || null);
    } catch {
      toast.error("Failed to fetch internship");
    }
  };

  const handleFileChange = (field, file) => {
    setFiles((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const uploadDocument = async (documentType, file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("internshipId", internship._id);
      formData.append("documentType", documentType);
      formData.append("document", file);

      await API.post("/internship/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`${documentType} uploaded`);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!internship?._id) {
      toast.error("No internship found");
      return;
    }

    setLoading(true);

    try {
      for (const [type, file] of Object.entries(files)) {
        if (file) {
          await uploadDocument(type, file);
        }
      }

      toast.success("All documents uploaded");
      fetchInternship();
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const removeDocument = async (documentType) => {
    if (!internship?._id) return;

    try {
      await API.post("/internship/remove-document", {
        internshipId: internship._id,
        documentType,
      });

      toast.success(`${documentType} removed`);
      fetchInternship();
    } catch (err) {
      toast.error("Remove failed");
      console.error(err);
    }
  };

  const triggerReplace = (documentType) => {
    fileInputRefs.current[documentType]?.click();
  };

  const handleReplaceFileChange = (documentType, e) => {
    const file = e.target.files[0];

    if (file) {
      uploadDocument(documentType, file).then(() => {
        e.target.value = "";
        fetchInternship();
      });
    }
  };

  const renderDoc = (label, key) => {
    const doc = internship?.documents?.[key];

    return (
      <div key={key}>
        <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
          <div>
            <p className="font-medium">{label}</p>
            <p className="text-xs text-gray-400">
              {doc?.url ? "Uploaded" : "Not Uploaded"}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            {doc?.url && (
              <>
                <a
                  href={`http://localhost:5000${doc.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                >
                  View
                </a>

                <button
                  onClick={() => triggerReplace(key)}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm"
                >
                  Replace
                </button>

                <button
                  onClick={() => removeDocument(key)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
                >
                  Remove
                </button>
              </>
            )}

            {doc?.verified && !doc?.url && (
              <span className="text-green-400 text-sm font-semibold">
                ✔ Previously Verified
              </span>
            )}
          </div>
        </div>

        {/* Hidden input */}
        {doc?.url && (
          <input
            ref={(el) => {
              if (el) fileInputRefs.current[key] = el;
            }}
            type="file"
            onChange={(e) => handleReplaceFileChange(key, e)}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
        )}
      </div>
    );
  };

  if (!internship) {
    return (
      <div className="p-8 text-center text-gray-400">
        No internship found. Please create one first.
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-slate-900/50 dark:to-indigo-900/20">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <HeroHeader 
            title="📁 Document Upload"
            subtitle="Upload required internship documents and track verification status."
          />
        </motion.div>

        {internship ? (
          <div className="space-y-12">
            {/* Upload Sections */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-3xl text-white font-black mb-10 text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                📤 Upload Documents
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { key: 'offerLetter', label: 'Offer Letter', icon: '📜' },
                  { key: 'completionCertificate', label: 'Completion Certificate', icon: '🏆' },
                  { key: 'finalReport', label: 'Final Report', icon: '📊' }
                ].map(({ key, label, icon }) => (
                  <motion.div 
                    key={key}
                    className="group relative"
                    whileHover={{ y: -8 }}
                  >
                    <input
                      id={`upload-${key}`}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileChange(key, e.target.files[0])}
                      className="hidden"
                    />
                    <label 
                      htmlFor={`upload-${key}`}
                      className="block w-full p-12 border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all shadow-xl hover:shadow-2xl text-center h-64 flex flex-col items-center justify-center bg-gradient-to-br from-white/70 to-gray-50/70 dark:from-gray-800/70 dark:to-gray-900/70 backdrop-blur-xl group-hover:scale-[1.02]"
                    >
                      <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{icon}</div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary">{label}</h4>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">Click to upload file</p>
                      <div className="w-24 h-24 border-4 border-dashed border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-primary/60 transition-all">
                        <span className="text-2xl">⬆️</span>
                      </div>
                      <p className="text-sm font-medium text-primary uppercase tracking-wide">PDF, Image</p>
                    </label>
                  </motion.div>
                ))}
              </div>
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                className="mx-auto mt-12 block bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6 px-16 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed w-fit"
              >
                {loading ? "⏳ Uploading..." : "🚀 Submit All Documents"}
              </motion.button>
            </motion.section>

            {/* Document Status */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-3xl text-white font-black mb-10 text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                ✅ Document Status
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { key: 'offerLetter', label: 'Offer Letter', color: 'blue' },
                  { key: 'completionCertificate', label: 'Completion Certificate', color: 'emerald' },
                  { key: 'finalReport', label: 'Final Report', color: 'purple' }
                ].map(({ key, label, color }) => {
                  const doc = internship?.documents?.[key];
                  const status = doc?.verified ? 'verified' : doc?.url ? 'uploaded' : 'pending';
                  return (
                    <motion.div 
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      className={`group p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all text-center ${status === 'verified' ? `bg-${color}-50 dark:bg-${color}-900/30 border-4 border-${color}-200` : status === 'uploaded' ? `bg-yellow-50 dark:bg-yellow-900/30 border-4 border-yellow-200` : `bg-gray-50 dark:bg-gray-900/50 border-4 border-gray-200`}`}
                    >
                      <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-white/20 transition-all`}>
                        <span className="text-3xl font-bold text-white drop-shadow-lg">
                          {status === 'verified' ? '✅' : status === 'uploaded' ? '⏳' : '📤'}
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 capitalize">{label}</h4>
                      <Badge status={status} className="mx-auto px-6 py-3 text-lg font-bold shadow-lg !text-white" />
                      {doc?.url ? (
                        <div className="mt-6 space-y-2">
                          <motion.a 
                            href={`http://localhost:5000${doc.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all text-center"
                          >
                            👁️ View Document
                          </motion.a>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            onClick={() => triggerReplace(key)}
                            className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white py-3 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                          >
                            🔄 Replace
                          </motion.button>
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm italic">Upload your document above</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 max-w-2xl mx-auto bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border border-white/50"
          >
            <div className="text-8xl mb-8 opacity-40">📁</div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
              No Internship Found
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
              Documents can be uploaded once you have an approved internship. Check your applications page.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Documents;
