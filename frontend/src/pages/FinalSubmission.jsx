import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";

const FinalSubmission = () => {
  const [internship, setInternship] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const res = await API.get("/internship/student");
        setInternship(res.data[0] || {});
      } catch (err) {
        console.error("Failed to fetch internship:", err);
      }
    };
    fetchInternship();
  }, []);

  const docTypeMap = {
    finalProjectReport: "finalReport",
    completionCertificate: "completionCertificate",
    presentationFile: "presentation",
  };

  const uploadDocument = async (fieldKey, file) => {
    if (!file || !internship._id) {
      alert("Please select a file and ensure internship is loaded");
      return;
    }

    const documentType = docTypeMap[fieldKey];
    if (!documentType) {
      alert("Invalid document type");
      return;
    }

    setLoading(true);
    setUploadProgress((prev) => ({ ...prev, [fieldKey]: 0 }));

    const formData = new FormData();
    formData.append("document", file);
    formData.append("internshipId", internship._id);
    formData.append("documentType", documentType);

    try {
      const res = await API.post("/internship/upload", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress((prev) => ({
              ...prev,
              [fieldKey]: percent,
            }));
          }
        },
      });

      // Update local state
      setInternship((prev) => ({
        ...prev,
        documents: {
          ...(prev.documents || {}),
          [documentType]: {
            url: res.data.url,
            verified: false,
          },
        },
      }));

      alert("Document uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert(
        `Upload failed: ${
          err.response?.data?.message || err.message
        }. Please reload and try again.`,
      );
    } finally {
      setLoading(false);
      setUploadProgress((prev) => ({ ...prev, [fieldKey]: 100 }));
      setTimeout(
        () => setUploadProgress((prev) => ({ ...prev, [fieldKey]: 0 })),
        2000,
      );
    }
  };

  const submitFinal = async () => {
    try {
      const requiredDocs = ["finalReport", "completionCertificate"];
      const missing = requiredDocs.filter(
        (doc) => !internship.documents?.[doc]?.url,
      );

      if (missing.length > 0) {
        alert(`Please upload: ${missing.join(", ")}`);
        return;
      }

      await API.put("/internship/student", {
        status: "completed",
      });

      alert("Final submission completed successfully!");
    } catch (err) {
      console.error("Failed to submit final:", err);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-emerald-900">
      <div className="max-w-4xl mx-auto space-y-12">
        <HeroHeader
          title="🎓 Final Submission"
          subtitle="Complete your internship with required documents and final submission. Your mentor will review immediately."
        />

        {internship._id ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Checklist */}
            <Card className="backdrop-blur-xl shadow-2xl p-10">
              <h3 className="text-3xl font-black mb-8 text-center text-black">
                Submission Checklist
              </h3>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    key: "finalProjectReport",
                    label: "Final Project Report",
                    icon: "📊",
                    required: true,
                  },
                  {
                    key: "completionCertificate",
                    label: "Completion Certificate",
                    icon: "🏆",
                    required: true,
                  },
                  {
                    key: "presentationFile",
                    label: "Presentation Slides",
                    icon: "🎬",
                    required: false,
                  },
                ].map(({ key, label, icon, required }) => {
                  const doc = internship.documents?.[docTypeMap[key]];
                  const uploaded = !!doc?.url;

                  return (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      className={`p-6 rounded-2xl shadow-lg text-center ${
                        uploaded
                          ? "bg-indigo-500"
                          : required
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                    >
                      <div className="text-4xl mb-4">{icon}</div>
                      <h4 className="font-bold">{label}</h4>

                      <Badge status={uploaded ? "Completed" : "Pending"} />

                      {uploaded ? (
                        <button
                          className="mt-4 bg-blue-400 text-white px-4 py-2 rounded"
                          onClick={() =>
                            window.open(
                              `http://localhost:5000${doc.url}`,
                              "_blank",
                            )
                          }
                        >
                          View File
                        </button>
                      ) : (
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={(e) =>
                            uploadDocument(key, e.target.files[0])
                          }
                          disabled={loading}
                          className="mt-4"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            {/* Progress */}
            <ProgressBar
              value={
                (Object.values(docTypeMap).filter(
                  (type) => internship.documents?.[type]?.url,
                ).length /
                  Object.keys(docTypeMap).length) *
                100
              }
              label="Completion Progress"
            />

            {/* Submit */}
            <button
              onClick={submitFinal}
              disabled={
                loading ||
                Object.values(docTypeMap).filter(
                  (type) => internship.documents?.[type]?.url,
                ).length < 2
              }
              className="w-full bg-green-600 text-white py-4 rounded-xl mt-6 disabled:opacity-50"
            >
              Complete Final Submission
            </button>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Loading Internship...</h2>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 text-white px-6 py-3 rounded"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalSubmission;
