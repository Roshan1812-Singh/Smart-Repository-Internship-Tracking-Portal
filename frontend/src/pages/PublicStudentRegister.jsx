import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

const PublicStudentRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    college: "",
    course: "",
    mentorEmail: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      newErrors.email = "Please enter valid email";
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    if (!formData.department.trim())
      newErrors.department = "Department required";
    if (!["1", "2", "3", "4"].includes(formData.year))
      newErrors.year = "Select valid year";
    if (!formData.college.trim()) newErrors.college = "College required";
    if (!formData.course.trim()) newErrors.course = "Course required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    setLoading(true);
    try {
      await API.post("/students/register", formData);

      toast.success("Registered successfully! Check your email for password.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const data = err?.response?.data;
      toast.error(
        data?.message || data?.error || "Network error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/50">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent text-center mb-8">
            Student Registration
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                  errors.name
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                  errors.email
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                placeholder="student@college.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                  errors.phone
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                placeholder="9920708233"
                maxLength="10"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                  errors.year
                    ? "border-red-400 bg-red-50"
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
                Department <span className="text-red-500">*</span>
              </label>
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                  errors.department
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                placeholder="Computer Science"
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                College <span className="text-red-500">*</span>
              </label>
              <input
                name="college"
                value={formData.college}
                onChange={handleChange}
                className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                  errors.college
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                placeholder="Your College Name"
              />
              {errors.college && (
                <p className="mt-1 text-sm text-red-600">{errors.college}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <input
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={`w-full p-4 rounded-2xl border-2 transition-all focus:ring-4 focus:ring-indigo-500/20 ${
                  errors.course
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                placeholder="B.Tech Computer Science"
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

            <div className="md:col-span-2 flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-2xl font-bold shadow-lg transition-all text-lg"
              >
                Have Account? Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-2xl font-bold shadow-2xl transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicStudentRegister;
