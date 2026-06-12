import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import { fileUrl } from "../config";
import HeroHeader from "../components/ui/HeroHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const Profile = () => {
  const [profile, setProfile] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/students/profile`);
        setProfile(res.data.student);
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [currentPhotoPreview, setCurrentPhotoPreview] = useState(null);
  const photoRef = useRef(null);
  const currentPhotoRef = useRef(null);
  const resumeRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append("profileImage", file);
      try {
        await API.post("/students/profile-image-upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPhotoPreview(null);
      } catch (err) {
        console.error("Photo upload failed:", err);
      }
      // Refresh profile after delay
      setTimeout(async () => {
        try {
          const res = await API.get(`/students/profile`);
          setProfile(res.data.student);
        } catch (err) {
          console.error("Profile refresh failed:", err);
        }
      }, 1000);
    }
  };

  const handleCurrentPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentPhotoPreview(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append("profileImage", file);
      try {
        await API.post("/students/profile-image-upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCurrentPhotoPreview(null);
      } catch (err) {
        console.error("Current photo upload failed:", err);
        setCurrentPhotoPreview(null);
      }
      setTimeout(async () => {
        const res = await API.get(`/students/profile`);
        setProfile(res.data.student);
      }, 500);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("resume", file);

      try {
        await API.post("/students/resume-upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        console.error("Upload failed:", err);
      }
      setTimeout(async () => {
        const res = await API.get(`/students/profile`);
        setProfile(res.data.student);
      }, 500);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/students/profile`, profile);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-900/50 dark:to-rose-900/20">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <HeroHeader
            title="Profile Management"
            subtitle="Update your professional details, upload photo & resume to complete your student profile."
          />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/40 row-span-1"
          >
            <h3 className="text-2xl text-white font-black mb-8 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent text-center">
              👤 Current Profile
            </h3>
            <div className="space-y-8 text-center">
              <div className="relative mx-auto">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 overflow-hidden ring-4 ring-white/50">
                  {currentPhotoPreview ||
                  profile.profileImage ||
                  profile.photo ? (
                    <img
                      src={
                        currentPhotoPreview ||
                        (profile.profileImage
                          ? fileUrl(profile.profileImage)
                          : fileUrl(profile.photo))
                      }
                      alt={currentPhotoPreview ? "Preview" : "Profile"}
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white drop-shadow-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || "S"}
                    </span>
                  )}
                </div>
                <input
                  ref={currentPhotoRef}
                  id="current-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCurrentPhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="current-photo-upload"
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl cursor-pointer transition-all border border-white/20 whitespace-nowrap text-sm"
                >
                  📸 Update Photo
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl">
                  <div className="w-12 h-12 bg-emerald-500/80 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">🎓</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
                      College
                    </p>
                    <p className="font-bold text-xl">
                      {profile.college || "Not set"}
                    </p>
                  </div>
                </div>
                {profile.resume && (
                  <motion.a
                    href={fileUrl(profile.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all text-center"
                  >
                    📄 View Resume
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <Card className="backdrop-blur-xl border-white/40 shadow-2xl p-2">
              <h3 className="text-2xl font-black mb-8 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent text-center p-8 rounded-2xl bg-gray-200 dark:bg-gray-900">
                ✏️ Edit Profile Details
              </h3>
              <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8"
              >
                {[
                  { key: "name", placeholder: "Full Name", icon: "👤" },
                  {
                    key: "email",
                    placeholder: "Email",
                    icon: "📧",
                    type: "email",
                  },
                  { key: "phone", placeholder: "Phone", icon: "📱" },
                  { key: "department", placeholder: "Department", icon: "🏢" },
                  { key: "year", placeholder: "Year/Semester", icon: "📚" },
                  {
                    key: "college",
                    placeholder: "College/University",
                    icon: "🎓",
                  },
                  { key: "course", placeholder: "Course/Program", icon: "📖" },
                ].map(({ key, placeholder, icon, type = "text" }) => (
                  <motion.div key={key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-900 uppercase tracking-wide">
                      <span>{icon}</span>
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={profile[key] || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, [key]: e.target.value })
                      }
                      className="w-full p-5 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white/50 dark:bg-gray-800/50 shadow-lg text-lg placeholder-gray-400"
                      required
                    />
                  </motion.div>
                ))}

                <motion.div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-bold text-gray-400 dark:text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                    📸 Profile Photo
                  </label>
                  <div className="relative group">
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="w-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all shadow-lg group-hover:shadow-xl h-48 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900/50"
                    >
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                        📷
                      </div>
                      <p className="font-bold text-xl text-gray-700 dark:text-gray-300 mb-2 group-hover:text-primary">
                        Choose Profile Photo
                      </p>
                      <p className="text-sm text-white">
                        PNG, JPG up to 2MB (Recommended: 400x400px)
                      </p>
                    </label>
                  </div>
                  {photoPreview && (
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-2 ring-emerald-200"
                      />
                      <div>
                        <p className="font-bold text-emerald-800 dark:text-emerald-200">
                          Photo ready to upload
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview(null);
                          }}
                          className="text-sm text-emerald-600 hover:underline mt-1"
                        >
                          Change photo
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                    📄 Resume/CV
                  </label>
                  <div className="relative group">
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="w-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-secondary/50 hover:bg-secondary/5 cursor-pointer transition-all shadow-lg group-hover:shadow-xl h-48 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900/50"
                    >
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                        📎
                      </div>
                      <p className="font-bold text-xl text-gray-700 dark:text-gray-300 mb-2 group-hover:text-secondary">
                        Upload Resume
                      </p>
                      <p className="text-sm text-white">
                        PDF, DOC, DOCX up to 5MB
                      </p>
                    </label>
                  </div>
                  {profile.resume && (
                    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl">
                      <div className="w-12 h-12 bg-blue-500/80 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">📄</span>
                      </div>
                      <div>
                        <p className="font-bold text-blue-800 dark:text-blue-800">
                          Resume uploaded
                        </p>
                        <a
                          href={fileUrl(profile.resume)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          👁️ View Resume
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.button
                  type="submit"
                  className="md:col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6 px-12 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all w-full uppercase tracking-wide flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  💾 Save Profile Changes
                </motion.button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
