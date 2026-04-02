import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import StarRating from "../components/ui/StarRating";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Timeline from "../components/ui/Timeline";

const FinalEvaluation = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: "",
    technicalSkills: 0,
    communication: 0,
    problemSolving: 0,
    workEthics: 0,
    comments: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/mentor/students-for-eval");
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleStudentChange = async (studentId) => {
    setFormData(prev => ({ ...prev, studentId }));
    
    const student = students.find(s => s._id === studentId);
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
      toast.success("Final evaluation submitted successfully!");
      setFormData({
        studentId: "",
        technicalSkills: 0,
        communication: 0,
        problemSolving: 0,
        workEthics: 0,
        comments: ""
      });
      setSelectedStudent(null);
    } catch (err) {
      console.error("Failed to submit", err);
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = (
    (formData.technicalSkills + formData.communication + formData.problemSolving + formData.workEthics) / 4
  ).toFixed(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100 dark:from-gray-900 dark:via-amber-900/20 dark:to-rose-900/20">
      <HeroHeader 
        title="Final Evaluations" 
        subtitle="Complete comprehensive final reviews for your interns using multi-criteria rating system."
      />

      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-12"
        >
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-gray-800 via-orange-600 to-rose-600 bg-clip-text text-transparent text-center">
            Final Evaluation Form
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-6">Select Intern</label>
              <select
                value={formData.studentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full p-6 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-3xl focus:ring-8 focus:ring-amber-200/50 focus:border-amber-500/50 transition-all bg-gradient-to-r from-white/70 to-amber-50/70 dark:from-gray-800/70 shadow-xl text-xl font-semibold bg-gray-500"
              >
                <option value="">Choose an intern to evaluate...</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} - {student.internship?.companyName} ({student.internship?.duration})
                  </option>
                ))}
              </select>

              {selectedStudent && (
                <Card className="mt-8 p-8 bg-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h3>
                      <p className="text-xl text-gray-600">{selectedStudent.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge status={selectedStudent.internship?.status} className="!px-4 !py-2 !text-base" />
                        <div className="text-sm text-gray-500">
                          {selectedStudent.internship?.duration} • {selectedStudent.internship?.companyName}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Ratings */}
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-8">Performance Ratings (1-10)</label>
              
              <div className="space-y-8">
                <div>
                  <label className="block font-bold text-lg text-gray-200 mb-4">Technical Skills</label>
                  <StarRating 
                    rating={formData.technicalSkills}
                    onChange={(value) => handleRatingChange('technicalSkills', value)}
                    size="lg"
                  />
                </div>
                
                <div>
                  <label className="block font-bold text-lg text-gray-200 mb-4">Communication</label>
                  <StarRating 
                    rating={formData.communication}
                    onChange={(value) => handleRatingChange('communication', value)}
                    size="lg"
                  />
                </div>
                
                <div>
                  <label className="block font-bold text-lg text-gray-200 mb-4">Problem Solving</label>
                  <StarRating 
                    rating={formData.problemSolving}
                    onChange={(value) => handleRatingChange('problemSolving', value)}
                    size="lg"
                  />
                </div>
                
                <div>
                  <label className="block font-bold text-lg text-gray-200 mb-4">Work Ethics</label>
                  <StarRating 
                    rating={formData.workEthics}
                    onChange={(value) => handleRatingChange('workEthics', value)}
                    size="lg"
                  />
                </div>
              </div>

              {/* Average */}
              {averageRating > 0 && (
                <div className="mt-12 p-8 bg-gradient-to-r from-amber-50 to-rose-50/80 dark:from-amber-900/30 rounded-3xl border border-amber-200/50 shadow-inner">
                  <h4 className="text-2xl font-bold text-gray-200 mb-4">Overall Rating</h4>
                  <div className="flex items-center gap-6">
                    <div className="text-5xl font-black bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                      {averageRating}
                    </div>
                    <StarRating rating={parseFloat(averageRating)} readonly size="lg" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="col-span-full">
            <label className="block text-xl font-bold text-gray-900 mb-6">Final Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Write your comprehensive final feedback. Highlight achievements, areas of growth, recommendations..."
              rows={6}
              className="w-full p-8 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-3xl focus:ring-8 focus:ring-primary/30 focus:border-primary/50 transition-all bg-white/60 dark:bg-gray-800/60 shadow-xl text-lg leading-relaxed placeholder-gray-200 resize-vertical"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={submitEvaluation}
            disabled={submitting || formData.studentId === "" || averageRating < 1}
            className={`w-full py-8 px-12 rounded-3xl font-bold text-2xl shadow-2xl transition-all duration-500 uppercase tracking-wide flex items-center justify-center gap-4 mx-auto max-w-md ${
              submitting || formData.studentId === "" || averageRating < 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-emerald-800 hover:-translate-y-0.8'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <span>🎓</span>
                Complete Evaluation
              </>
            )}
          </motion.button>
        </motion.div>

        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent">
              Evaluation Timeline
            </h3>
            <Timeline 
            className="text-white"
              items={[
                {
                  title: 'Internship Completed',
                  description: `${selectedStudent.internship?.duration} at ${selectedStudent.internship?.companyName}`,
                  status: 'completed',
                  date: selectedStudent.internship?.endDate,
                  icon: '🎓'
                },
                {
                  title: 'Final Evaluation',
                  description: 'Multi-criteria performance review',
                  status: 'pending',
                  date: new Date(),
                  icon: '⭐'
                }
              ]}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FinalEvaluation;

