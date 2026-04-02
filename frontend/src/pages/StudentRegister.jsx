import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const StudentRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Files, 3: Complete
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
    phone: "",
    department: "",
    year: "",
    college: "",
    course: "",
    mentorEmail: "",
  });
  const [errors, setErrors] = useState({});
  const [previewProfile, setPreviewProfile] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState({
    profile: false,
    resume: false,
  });

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/))
      newErrors.email = "Valid email required";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.phone.match(/^\d{10}$/))
      newErrors.phone = "10-digit phone required";
    if (!formData.department.trim())
      newErrors.department = "Department required";
    if (!formData.year || !["1", "2", "3", "4"].includes(formData.year))
      newErrors.year = "Valid year (1-4) required";
    if (!formData.college.trim()) newErrors.college = "College required";
    if (!formData.course.trim()) newErrors.course = "Course required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const togglePassword = (field) => {
    setFormData({
      ...formData,
      [`show${field.charAt(0).toUpperCase() + field.slice(1)}`]:
        !formData[`show${field.charAt(0).toUpperCase() + field.slice(1)}`],
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Send only needed fields (backend ignores confirmPw)
    const registerData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      department: formData.department,
      year: formData.year,
      college: formData.college,
      course: formData.course,
      mentorEmail: formData.mentorEmail,
    };

    setLoading(true);
    try {
      const res = await API.post("/students/register", registerData);
      setStudentId(res.data.userId);
      toast.success(
        "Registered successfully! Login with your password & upload files next.",
      );
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (type === "profile") setPreviewProfile(ev.target.result);
        else setPreviewResume(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (type) => {
    const formDataFile = new FormData();
    formDataFile.append(
      type === "profile" ? "profileImage" : "resume",
      type === "profile"
        ? previewProfile.split(",")[1]
        : previewResume.split(",")[1],
    );

    setUploadingFiles({ ...uploadingFiles, [type]: true });
    try {
      const endpoint =
        type === "profile"
          ? "/students/profile-image-upload"
          : "/students/resume-upload";
      await API.post(endpoint, formDataFile, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${type} uploaded successfully!`);
    } catch (err) {
      toast.error(`${type} upload failed`);
    } finally {
      setUploadingFiles({ ...uploadingFiles, [type]: false });
    }
  };

  const handleComplete = () => {
    setStep(3);
    setTimeout(() => navigate("/login"), 2000);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl max-w-md w-full mx-4">
          <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-12 h-12 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Success!</h2>
          <p className="text-white/90 mb-8">
            Registration complete. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/50">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Student Registration
            </h1>
            <div className="flex justify-center gap-2 mb-8">
              <div
                className={`w-24 h-2 rounded-full transition-all ${step >= 1 ? "bg-indigo-600" : "bg-gray-300"}`}
              />
              <div
                className={`w-24 h-2 rounded-full transition-all ${step >= 2 ? "bg-indigo-600" : "bg-gray-300"}`}
              />
              <div
                className={`w-24 h-2 rounded-full transition-all ${step === 3 ? "bg-indigo-600" : "bg-gray-300"}`}
              />
            </div>
          </div>

          {step === 1 && (
            <form
              onSubmit={handleRegister}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                    errors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                  placeholder="your.email@college.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  name="password"
                  type={formData.showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                  placeholder="Choose a strong password (min 6 chars)"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  name="confirmPassword"
                  type={formData.showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                    errors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                    errors.phone
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                  placeholder="10 digit phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                    errors.year
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                    errors.department
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                  placeholder="Computer Science, Mechanical, etc."
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.department}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  College *
                </label>
                <input
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                    errors.college
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                  placeholder="Your college/university name"
                />
                {errors.college && (
                  <p className="mt-1 text-sm text-red-600">{errors.college}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course *
                </label>
                <input
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                    errors.course
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                  placeholder="B.Tech CSE, B.Sc Physics, etc."
                />
                {errors.course && (
                  <p className="mt-1 text-sm text-red-600">{errors.course}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mentor Email (Optional)
                </label>
                <input
                  name="mentorEmail"
                  type="email"
                  value={formData.mentorEmail}
                  onChange={handleChange}
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-indigo-300 focus:ring-4 focus:ring-indigo-500/20 transition-all"
                  placeholder="mentor@college.com (optional)"
                />
              </div>

              <div className="md:col-span-2 flex gap-4 justify-center pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-2xl transition-all shadow-lg"
                >
                  Have Account? Login
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register & Continue"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 2 && studentId && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h2>
              <p className="text-xl text-gray-600 mb-12">
                Check your email for login credentials. Now upload your files:
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 hover:border-indigo-400 transition-all group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "profile")}
                    className="hidden"
                    id="profile"
                  />
                  <label htmlFor="profile" className="cursor-pointer block">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-bold text-xl mb-2">Profile Photo</h3>
                      <p className="text-gray-500 text-sm">JPG/PNG (max 2MB)</p>
                      {previewProfile && (
                        <img
                          src={previewProfile}
                          alt="Preview"
                          className="mt-4 w-32 h-32 object-cover rounded-2xl mx-auto shadow-lg"
                        />
                      )}
                    </div>
                  </label>
                  <button
                    onClick={() => document.getElementById("profile").click()}
                    disabled={uploadingFiles.profile || !previewProfile}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all"
                  >
                    {uploadingFiles.profile ? "Uploading..." : "Upload Profile"}
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 hover:border-green-400 transition-all group cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc"
                    onChange={(e) => handleFileChange(e, "resume")}
                    className="hidden"
                    id="resume"
                  />
                  <label htmlFor="resume" className="cursor-pointer block">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-bold text-xl mb-2">Resume</h3>
                      <p className="text-gray-500 text-sm">PDF/DOC (max 5MB)</p>
                      {previewResume && (
                        <div className="mt-4 bg-gray-100 p-4 rounded-xl mx-auto max-w-sm">
                          <p className="font-medium text-sm">Resume Preview</p>
                        </div>
                      )}
                    </div>
                  </label>
                  <button
                    onClick={() => document.getElementById("resume").click()}
                    disabled={uploadingFiles.resume || !previewResume}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all"
                  >
                    {uploadingFiles.resume ? "Uploading..." : "Upload Resume"}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 max-w-md mx-auto px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-2xl shadow-lg transition-all"
                >
                  Skip & Login
                </button>
                <button
                  onClick={handleComplete}
                  disabled={uploadingFiles.profile || uploadingFiles.resume}
                  className="flex-1 max-w-md mx-auto px-12 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-2xl transition-all disabled:opacity-50"
                >
                  Complete Registration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
