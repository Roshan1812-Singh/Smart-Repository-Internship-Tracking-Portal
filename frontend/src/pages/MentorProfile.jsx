import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from "../api/axios";
import HeroHeader from "../components/ui/HeroHeader";
import StatCard from "../components/ui/StatCard";
import StarRating from "../components/ui/StarRating";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import DataTable from "../components/ui/DataTable";
import Timeline from "../components/ui/Timeline";
import * as MentorService from "../services/mentorService";

const MentorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState([]);
  const [localDocuments, setLocalDocuments] = useState([]);
  const [localResources, setLocalResources] = useState([]);
  const [skillsInput, setSkillsInput] = useState('');
  const [newDocumentName, setNewDocumentName] = useState('');
  const [newResource, setNewResource] = useState({name: '', type: 'Docs'});
  const documentFileRef = useRef(null);
  const resourceFileRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, studentsRes] = await Promise.all([
        API.get("/mentor/profile"),
        API.get("/mentor/assigned-students")
      ]);
      
      const profileData = profileRes.data;
      setProfile(profileData);
      setAssignedStudents(studentsRes.data.students || []);
      
      setEditingData(profileData);
      setEditingSchedule(profileData.availabilitySchedule || generateDefaultSchedule());
      
      setFeedbacks([
        { student: "John Doe", rating: 9.2, comment: "Outstanding mentor!", date: "2024-01-15" },
        { student: "Jane Smith", rating: 8.7, comment: "Very supportive", date: "2024-01-10" },
        { student: "Bob Wilson", rating: 9.8, comment: "Best mentor ever!", date: "2023-12-20" }
      ]);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultSchedule = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      slots: [{ start: '10:00', end: '18:00', booked: false }]
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const res = await MentorService.updateMentorProfile(editingData);
      setProfile(res.data);
      setEditMode(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleSkillAdd = () => {
    if (skillsInput.trim()) {
      setEditingData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillsInput.trim()]
      }));
      setSkillsInput('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setEditingData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(skill => skill !== skillToRemove)
    }));
  };

  const handleDocumentUpload = async () => {
    if (!documentFileRef.current.files[0] || !newDocumentName) return;
    const formData = new FormData();
    formData.append('file', documentFileRef.current.files[0]);
    formData.append('name', newDocumentName);
    try {
      await MentorService.uploadDocument(formData);
      setNewDocumentName('');
      documentFileRef.current.value = '';
      fetchProfile();
      toast.success('Document uploaded');
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleResourceUpload = async () => {
    if (!resourceFileRef.current.files[0] || !newResource.name) return;
    const formData = new FormData();
    formData.append('file', resourceFileRef.current.files[0]);
    formData.append('name', newResource.name);
    formData.append('type', newResource.type);
    try {
      await MentorService.uploadResource(formData);
      setNewResource({name: '', type: 'Docs'});
      resourceFileRef.current.value = '';
      fetchProfile();
      toast.success('Resource uploaded');
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      await MentorService.updateSchedule({ availabilitySchedule: editingSchedule });
      setProfile(prev => ({ ...prev, availabilitySchedule: editingSchedule }));
      setShowScheduleModal(false);
      toast.success('Schedule updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

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

const profileData = profile?.user || {};
  const stats = profile?.stats || {};

  const profileSections = editMode ? [
    {
      title: "Edit Basic Information",
      items: [
        { label: "Full Name", value: profileData.name, icon: "👤", editable: false },
        { label: "Designation", value: (
          <input 
            value={editingData.designation || ''} 
            onChange={(e) => setEditingData(prev => ({...prev, designation: e.target.value}))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Enter designation"
          />
        ), icon: "💼" },
        { label: "Organization", value: (
          <input 
            value={editingData.organization || ''} 
            onChange={(e) => setEditingData(prev => ({...prev, organization: e.target.value}))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Enter organization"
          />
        ), icon: "🏢" },
        { label: "Department", value: (
          <input 
            value={editingData.department || ''} 
            onChange={(e) => setEditingData(prev => ({...prev, department: e.target.value}))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Enter department"
          />
        ), icon: "⚙️" },
        { label: "Years of Experience", value: (
          <input 
            type="number" 
            value={editingData.experience || 0} 
            onChange={(e) => setEditingData(prev => ({...prev, experience: Number(e.target.value)}))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Years"
          />
        ), icon: "📈" }
      ]
    },
    {
      title: "Edit Contact Information",
      items: [
        { label: "Email", value: profileData.email, icon: "📧", editable: false },
        { label: "LinkedIn", value: (
          <input 
            value={editingData.linkedin || ''} 
            onChange={(e) => setEditingData(prev => ({...prev, linkedin: e.target.value}))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="https://linkedin.com/in/profile"
          />
        ), icon: "💼" },
        { label: "Phone", value: (
          <input 
            value={editingData.phone || ''} 
            onChange={(e) => setEditingData(prev => ({...prev, phone: e.target.value}))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Phone number"
          />
        ), icon: "📱" }
      ]
    }
  ] : [
    {
      title: "Basic Information",
      items: [
        { label: "Full Name", value: profileData.name, icon: "👤" },
        { label: "Designation", value: editingData.designation || profile?.designation || "Senior Developer", icon: "💼" },
        { label: "Organization", value: editingData.organization || profile?.organization || "Tech Corp", icon: "🏢" },
        { label: "Department", value: editingData.department || profile?.department || "Software Engineering", icon: "⚙️" },
        { label: "Years of Experience", value: `${editingData.experience || profile?.experience || 0}+ years`, icon: "📈" }
      ]
    },
    {
      title: "Contact Information",
      items: [
        { label: "Email", value: profileData.email, icon: "📧" },
        { label: "LinkedIn", value: editingData.linkedin || profile?.linkedin ? (
          <a href={editingData.linkedin || profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">View Profile →</a>
        ) : 'N/A', icon: "💼" },
        { label: "Phone", value: editingData.phone || profile?.phone || 'N/A', icon: "📱" }
      ]
    }
  ];

  const skills = editingData.skills || profile?.skills || [];

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };


  const documents = profile?.documents || [];
  const resources = profile?.resources || [];

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-100/50 dark:from-gray-900 dark:via-slate-900/50 dark:to-indigo-900/20">
      <HeroHeader 
        title={`${profileData.name || 'Mentor'}`}
        subtitle="Your comprehensive professional profile and mentorship dashboard"
      />

      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary via-purple-600 to-secondary text-white/95 rounded-4xl p-12 lg:p-20 shadow-2xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-r from-white/20 to-transparent rounded-full blur-3xl animate-pulse" />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
            <div className="lg:pr-16">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/30">
                  <span className="text-4xl font-black drop-shadow-2xl">
                    {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : 'MP'}
                  </span>
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-2">
                    {profileData.name || 'Mentor Profile'}
                  </h1>
                  <p className="text-2xl opacity-90">{profile?.designation || 'Senior Mentor'}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {profile?.skills?.slice(0, 6).map((skill, idx) => (
                  <motion.span
                    key={skill}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-2xl font-bold text-lg shadow-lg hover:bg-white/30 transition-all cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>

              <div className="flex gap-4">
                <motion.a 
                  href={profile?.linkedin} 
                  target="_blank"
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex-1 bg-white/20 backdrop-blur-xl px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-white/30 hover:shadow-xl transition-all border border-white/30 flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0h.002z"/>
                  </svg>
                  LinkedIn Profile
                </motion.a>
                <motion.button
                  onClick={toggleEditMode}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all border border-white/30 flex items-center justify-center gap-3"
                >
                  {editMode ? (
                    <>
                      💾 Save Changes
                    </>
                  ) : (
                    <>
                      ✏️ Edit Profile
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black" >
              <StatCard 
                className="text-black"
                title="Interns Mentored" 
                value={stats.assignedStudents || 0}
                color="from-emerald-500/80 to-teal-600/80"
                icon="bg-emerald-400/50"
              />
              <StatCard 
                title="Avg Rating" 
                value={`${stats.successPercentage || 0}%`}
                color="from-amber-500/80 to-orange-600/80"
                icon="bg-amber-400/50"
              />
              <StatCard 
                title="Internships Active" 
                value="12"
                color="from-blue-500/80 to-indigo-600/80"
                icon="bg-blue-400/50"
              />
              <StatCard 
                title="Success Rate" 
                value="94%"
                color="from-purple-500/80 to-violet-600/80"
                icon="bg-purple-400/50"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {profileSections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-10">
                <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent pb-6 border-b-4 border-primary/30">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.items.map((item, itemIdx) => (
                    <div key={item.label} className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 hover:from-blue-100 hover:to-indigo-100 group">
                      <div className={`w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform ${item.icon}`}>
                        <span className="text-xl font-bold text-white drop-shadow-lg">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1 opacity-80">
                          {item.label}
                        </p>
                        <p className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Skills & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-10">
              <h3 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                💡 Skills & Expertise
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {skills.map((skill, idx) => (
                  <motion.div
                    key={skill}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-200/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:from-emerald-500/20 hover:border-emerald-400/70 transition-all duration-500 hover:-translate-y-2 cursor-default"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <span className="text-2xl font-bold text-white drop-shadow-lg">⚡</span>
                      </div>
                      <h4 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-emerald-700">{skill}</h4>
                      <p className="text-sm text-gray-600">Expert Level</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Feedback & Ratings */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-10">
              <h3 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                ⭐ Feedback History
              </h3>
              <div className="space-y-6">
                {feedbacks.map((feedback, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-6 p-6 rounded-3xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/30 border border-amber-200/50 hover:shadow-xl transition-all"
                  >
                    <StarRating rating={feedback.rating} readonly size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-xl">{feedback.student}</h4>
                        <Badge status="approved" className="!text-sm" />
                      </div>
                      <p className="text-gray-700 italic">"{feedback.comment}"</p>
                      <p className="text-sm text-gray-500 mt-2">{feedback.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Assigned Interns Table */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className="p-10 pb-6">
              <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                👥 Assigned Interns ({assignedStudents.length})
              </h3>
            </div>
            <DataTable
              columns={[
                { key: 'name', label: 'Intern Name', sortable: true },
                { key: 'internship.companyName', label: 'Company', sortable: true },
                { key: 'internship.role', label: 'Position', sortable: true },
                { key: 'internship.status', label: 'Status', render: (_, row) => <Badge status={row.internship?.status} /> },
                { key: 'lateSubs', label: 'Late Subs', render: (lateSubs) => (
                  <Badge status={lateSubs > 0 ? 'rejected' : 'approved'}>
                    {lateSubs}
                  </Badge>
                ) },
                { key: 'department', label: 'Department' }
              ]}
              data={assignedStudents}
              searchPlaceholder="Search interns by name or company..."
            />
          </Card>
        </motion.div>

        {/* Schedule & Availability */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
          <Card className="p-10">
            <h3 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              📅 Availability Schedule
            </h3>
  <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-center">
              {(editingSchedule || generateDefaultSchedule()).map(({day, slots}) => (
                <div key={day} className="p-4 rounded-2xl bg-gradient-to-b from-emerald-100 to-emerald-200 dark:from-emerald-900/50 border-2 border-emerald-300/50 shadow-md">
                  <div className="font-bold text-lg text-emerald-800">{day}</div>
                  {slots.map((slot, i) => (
                    <div key={i} className="text-xl font-black text-emerald-600">
                      {slot.start} - {slot.end} {slot.booked ? '(Booked)' : '(Free)'}
                    </div>
                  ))}
                  <motion.button 
                    onClick={() => setShowScheduleModal(true)}
                    whileHover={{ scale: 1.05 }}
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Edit
                  </motion.button>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 px-12 py-6 rounded-3xl text-xl font-bold text-white shadow-2xl hover:shadow-3xl transition-all"
              >
                📱 Book Meeting Slot
              </motion.button>
            </div>
          </Card>

          <Card className="p-10">
            <h3 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              🏆 Achievements & Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "AWS Certified Architect", date: "2023", icon: "☁️" },
                { title: "Google Cloud Professional", date: "2023", icon: "🌐" },
                { title: "Mentor of the Year", date: "2022", icon: "⭐" },
                { title: "10+ Interns Successfully Mentored", date: "Ongoing", icon: "🎓" }
              ].map((achievement, idx) => (
                <motion.div
                  key={achievement.title}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group p-8 rounded-3xl bg-gradient-to-r from-purple-100/50 to-violet-100/50 dark:from-purple-900/30 border-2 border-purple-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-default overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 blur-xl" />
                  <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0 group-hover:scale-110">
                      <span className="text-2xl font-bold text-white drop-shadow-lg">{achievement.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl">{achievement.title}</h4>
                      <p className="text-purple-700 font-semibold">{achievement.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Resources Shared */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className="p-10 pb-6">
              <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                📚 Resources Shared
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-10 bg-gray-600">
              {resources.slice(0, 6).map((resource, idx) => (
                <motion.a
                  key={resource._id || idx}
href={`http://localhost:5000${resource.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group block p-8 rounded-3xl bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-900/30 border-2 border-blue-200/50 hover:shadow-2xl hover:bg-gradient-to-br hover:from-primary/10 hover:border-primary/40 transition-all relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-10 blur-xl transition-opacity text-black" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br from-${resource.type === 'Docs' ? 'blue' : resource.type === 'Video' ? 'purple' : resource.type === 'Repo' ? 'emerald' : 'orange'}-500 to-${resource.type === 'Docs' ? 'cyan' : resource.type === 'Video' ? 'violet' : resource.type === 'Repo' ? 'teal' : 'rose'}-600 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 group-hover:scale-110 text-black`}>
                      <span className={`text-2xl font-bold text-black drop-shadow-lg ${
                        resource.type === 'Docs' ? '📚' : 
                        resource.type === 'Video' ? '🎥' : 
                        resource.type === 'Repo' ? '💻' : 
                        '📄'
                      }`}></span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{resource.name}</h4>
                      <Badge status={resource.type.toLowerCase()} className="!px-4 !py-2 !font-semibold" />
                    </div>
                  </div>
                </motion.a>
              ))}
              {resources.length < 6 && (
                <Card className="p-8 col-span-1 md:col-span-2 lg:col-span-1 text-center hover:shadow-xl transition-all  bg-gray-400">
                  <motion.button 
                    onClick={() => resourceFileRef.current?.click()}
                    whileHover={{ scale: 1.05 }}
                    className="w-full bg-gradient-to-r from-primary to-secondary bg-blue-500 text-white p-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl"
                  >
                    + Upload Resource
                  </motion.button>
                  <input 
                    ref={resourceFileRef}
                    type="file" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewResource(prev => ({...prev, file}));
                      }
                    }}
                  />
                  {newResource.file && (
                    <div className="mt-4 p-4 bg-gray-500 rounded-xl">
                      <p className="font-semibold">{newResource.file.name}</p>
                      <input 
                        value={newResource.name}
                        onChange={(e) => setNewResource(prev => ({...prev, name: e.target.value}))}
                        placeholder="Resource name"
                        className="w-full p-2 mt-2 border rounded-lg bg-gray-500 text-white"
                      />
                      <select 
                        value={newResource.type}
                        onChange={(e) => setNewResource(prev => ({...prev, type: e.target.value}))}
                        className="w-full p-2 mt-2 border rounded-lg bg-gray-500"
                      >
                        <option>Docs</option>
                        <option>Video</option>
                        <option>Repo</option>
                        <option>PDF</option>
                        <option>Guide</option>
                      </select>
                      <motion.button 
                        onClick={handleResourceUpload}
                        whileHover={{ scale: 1.05 }}
                        className="w-full mt-3 bg-green-500 text-white p-3 rounded-xl font-bold"
                      >
                        Confirm Upload
                      </motion.button>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MentorProfile;

