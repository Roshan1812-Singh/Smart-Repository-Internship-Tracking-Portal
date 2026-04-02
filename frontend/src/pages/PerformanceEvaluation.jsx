import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import StarRating from "../components/ui/StarRating";
import Card from "../components/ui/Card";
import Timeline from "../components/ui/Timeline";
import Badge from "../components/ui/Badge";

const PerformanceEvaluation = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    technicalSkills: 0,
    communication: 0,
    problemSolving: 0,
    workEthics: 0,
    comments: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/mentor/assigned-students");
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Failed to fetch students");
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (category, value) => {
    setFormData((prev) => ({ ...prev, [category]: value }));
  };

  const handleStudentChange = async (studentId) => {
    setFormData((prev) => ({ ...prev, studentId }));
    const student = students.find((s) => s._id === studentId);
    setSelectedStudent(student);
  };

  const submitEvaluation = async () => {
    if (formData.studentId === "" || formData.technicalSkills === 0) {
      toast.error("Please select student and complete all ratings");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/mentor/evaluation", formData);
      toast.success("Performance evaluation submitted successfully!");
      setFormData({
        studentId: "",
        technicalSkills: 0,
        communication: 0,
        problemSolving: 0,
        workEthics: 0,
        comments: "",
      });
      setSelectedStudent(null);
    } catch (err) {
      console.error("Failed to submit", err);
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = selectedStudent
    ? (
        (formData.technicalSkills +
          formData.communication +
          formData.problemSolving +
          formData.workEthics) /
        4
      ).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900/50 dark:to-indigo-900/20">
      <div className="max-w-6xl mx-auto">
        <HeroHeader
          title="📊 Ongoing Performance Review"
          subtitle="Regular check-ins to track intern progress and provide timely feedback during internship."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-12"
        >
          <Card className="backdrop-blur-xl shadow-2xl border-white/40 p-2">
            <div className="p-10 lg:p-12">
              <h2 className="text-4xl font-black mb-12 bg-gradient-to-r from-gray-900 via-orange-600 to-rose-600 bg-clip-text text-transparent text-center">
                Evaluation Form
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div>
                  <label className="block text-xl font-bold text-gray-900 mb-8">
                    Select Intern
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="w-full p-6 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-3xl focus:ring-8 focus:ring-orange-200/50 focus:border-orange-500 transition-all bg-white/70 dark:bg-gray-800/70 shadow-xl text-xl font-semibold"
                  >
                    <option value="">Choose intern to evaluate...</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} -{" "}
                        {student.internship?.companyName || "N/A"}
                      </option>
                    ))}
                  </select>

                  {selectedStudent && (
                    <Card className="mt-8 p-8 backdrop-blur-sm bg-gradient-to-br from-orange-50/80 to-rose-50/80">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl">
                          {selectedStudent.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {selectedStudent.name}
                          </h3>
                          <p className="text-xl text-gray-600">
                            {selectedStudent.email}
                          </p>
                          <Badge
                            status={
                              selectedStudent.internship?.status || "active"
                            }
                            className="!px-4 !py-2 !text-base mt-2"
                          />
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Ratings */}
                <div>
                  <label className="block text-xl font-bold text-gray-900 mb-8">
                    Performance Ratings (1-10)
                  </label>

                  <div className="space-y-8">
                    <div>
                      <label className="block font-bold text-lg mb-6 text-gray-800">
                        Technical Skills
                      </label>
                      <StarRating
                        rating={formData.technicalSkills}
                        onChange={(value) =>
                          handleRatingChange("technicalSkills", value)
                        }
                        size="lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-lg mb-6 text-gray-800">
                        Communication
                      </label>
                      <StarRating
                        rating={formData.communication}
                        onChange={(value) =>
                          handleRatingChange("communication", value)
                        }
                        size="lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-lg mb-6 text-gray-800">
                        Problem Solving
                      </label>
                      <StarRating
                        rating={formData.problemSolving}
                        onChange={(value) =>
                          handleRatingChange("problemSolving", value)
                        }
                        size="lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-lg mb-6 text-gray-800">
                        Work Ethics
                      </label>
                      <StarRating
                        rating={formData.workEthics}
                        onChange={(value) =>
                          handleRatingChange("workEthics", value)
                        }
                        size="lg"
                      />
                    </div>
                  </div>

                  {averageRating > 0 && (
                    <div className="mt-12 p-8 bg-gradient-to-r from-orange-500/10 to-rose-500/10 dark:from-orange-500/20 rounded-3xl border border-orange-200/50 shadow-inner">
                      <h4 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        Overall Rating{" "}
                        <span className="text-3xl">{averageRating}</span>
                      </h4>
                      <StarRating
                        rating={parseFloat(averageRating)}
                        readonly
                        size="lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-full mt-12">
                <label className="block text-xl font-bold text-gray-900 mb-6">
                  Detailed Feedback
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      comments: e.target.value,
                    }))
                  }
                  placeholder="Provide comprehensive feedback highlighting strengths, areas for improvement, specific examples..."
                  rows={5}
                  className="w-full p-8 text-gray-100 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-3xl focus:ring-8 focus:ring-orange-500/30 focus:border-orange-500 transition-all bg-white/60 dark:bg-gray-800/60 shadow-xl text-lg leading-relaxed placeholder-gray-200 resize-vertical"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitEvaluation}
                disabled={
                  submitting || formData.studentId === "" || averageRating < 1
                }
                className={`w-full lg:w-auto lg:max-w-md mx-auto py-8 px-12 rounded-3xl font-black text-xl shadow-2xl transition-all uppercase tracking-wide flex items-center justify-center gap-3 mt-12 ${
                  submitting || formData.studentId === "" || averageRating < 1
                    ? "bg-gray-400 text-gray-500 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-orange-500 via-rose-500 to-orange-600 text-white shadow-orange-500/50 hover:shadow-orange-500/70 hover:from-orange-600 hover:to-rose-600"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>⭐</span>
                    Submit Evaluation
                  </>
                )}
              </motion.button>
            </div>
          </Card>

          {selectedStudent && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-3xl font-black mb-8 text-center bg-gradient-to-r from-gray-900 via-orange-600 to-rose-600 bg-clip-text text-transparent">
                Evaluation Timeline
              </h3>
              <Timeline
                items={[
                  {
                    title: "Performance Review",
                    description: "Multi-criteria competency assessment",
                    status: "current",
                    date: new Date(),
                    icon: "⭐",
                  },
                  {
                    title: "Intern Progress",
                    description: `${selectedStudent.internship?.duration || "Ongoing"} at ${selectedStudent.internship?.companyName || "Company"}`,
                    status: "completed",
                    date: selectedStudent.internship?.startDate,
                    icon: "📈",
                  },
                ]}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PerformanceEvaluation;
