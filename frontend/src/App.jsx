import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/authSlice";

import Login from "./pages/Login";
import PublicStudentRegister from "./pages/PublicStudentRegister"; // ✅ FIXED: No auth
import StudentRegister from "./pages/StudentRegister"; // Legacy (upload files)
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Layout from "./components/layout/Layout";

import StudentLayout from "./components/layout/StudentLayout";
import MentorLayout from "./components/layout/MentorLayout";
import StudentDashboard from "./pages/StudentDashboard";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import MentorProfile from "./pages/MentorProfile";
import InternshipDetails from "./pages/InternshipDetails";
import Reports from "./pages/Reports";
import Tasks from "./pages/Tasks";
import Documents from "./pages/Documents";
import Feedback from "./pages/Feedback";
import FinalSubmission from "./pages/FinalSubmission";
import AssignedStudents from "./pages/AssignedStudents";
import ReportReview from "./pages/ReportReview";
import TaskManagement from "./pages/TaskManagement";
import PerformanceEvaluation from "./pages/PerformanceEvaluation";
import MentorMessages from "./pages/MentorMessages";
import StudentManagement from "./pages/StudentManagement";
import MentorManagement from "./pages/MentorManagement";
import InternshipTracking from "./pages/InternshipTracking";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import Notifications from "./pages/Notifications";
import DocumentVerification from "./pages/DocumentVerification";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminManagement from "./pages/AdminManagement";
import PermissionManagement from "./pages/PermissionManagement";
import UserManagement from "./pages/UserManagement";
import SystemConfiguration from "./pages/SystemConfiguration";
import DataBackup from "./pages/DataBackup";
import SecurityControls from "./pages/SecurityControls";
import FinalEvaluation from "./pages/FinalEvaluation";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setUser(parsedUser));
      }
    } catch (error) {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    }
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* PUBLIC */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route path="/login" element={<Login />} />
<Route path="/register" element={<PublicStudentRegister />} /> {/* ✅ FIXED: Public register (no auth) */}
          <Route path="/student/register" element={<StudentRegister />} /> {/* File uploads only */}
          <Route path="/superadmin-login" element={<SuperAdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          {/* STUDENT */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="internship" element={<InternshipDetails />} />
            <Route path="reports" element={<Reports />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="documents" element={<Documents />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="final" element={<FinalSubmission />} />
          </Route>
          {/* MENTOR */}
          <Route
            path="/mentor"
            element={
              <ProtectedRoute allowedRoles={["mentor"]}>
                <MentorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MentorDashboard />} />
            <Route path="students" element={<AssignedStudents />} />
            <Route path="reports" element={<ReportReview />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="evaluation" element={<PerformanceEvaluation />} />
            <Route path="messages" element={<MentorMessages />} />
            <Route path="final" element={<FinalEvaluation />} />
            <Route path="profile" element={<MentorProfile />} />
          </Route>
          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="mentors" element={<MentorManagement />} />
            <Route path="internships" element={<InternshipTracking />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="documents" element={<DocumentVerification />} />
          </Route>
          {/* SUPER ADMIN */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="admin-management" element={<AdminManagement />} />
            <Route
              path="permission-management"
              element={<PermissionManagement />}
            />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="system-config" element={<SystemConfiguration />} />
            <Route path="data-backup" element={<DataBackup />} />
            <Route path="security-controls" element={<SecurityControls />} />
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
