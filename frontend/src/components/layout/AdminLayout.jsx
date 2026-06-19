import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getStoredUser } from "../../utils/auth";

const ADMIN_LINKS = [
  ["/admin", "Dashboard"],
  ["/admin/students", "Student Management"],
  ["/admin/mentors", "Mentor Management"],
  ["/admin/internships", "Internship Tracking"],
  ["/admin/reports", "Reports & Analytics"],
  ["/admin/notifications", "Notifications"],
  ["/admin/documents", "Document Verification"],
];

const SUPERADMIN_LINKS = [
  ["/superadmin", "Dashboard"],
  ["/superadmin/admin-management", "Admin Management"],
  ["/superadmin/permission-management", "Permission Management"],
  ["/superadmin/user-management", "User Management"],
  ["/superadmin/system-config", "System Configuration"],
  ["/superadmin/data-backup", "Data Backup"],
  ["/superadmin/security-controls", "Security Controls"],
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const user = getStoredUser();
  const isSuperAdmin = location.pathname.startsWith("/superadmin");
  const links = isSuperAdmin ? SUPERADMIN_LINKS : ADMIN_LINKS;

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDarkMode(isDark);
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const navItem = (to, label) => (
    <Link
      key={to}
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={`block px-4 py-2 rounded-lg transition ${
        location.pathname === to
          ? "bg-primary text-white"
          : "hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex">
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary mb-6">
            {isSuperAdmin ? "SUPER ADMIN PANEL" : "ADMIN PANEL"}
          </h2>

          <nav className="flex flex-col gap-2">
            {links.map(([to, label]) => navItem(to, label))}
          </nav>

          <button
            onClick={logout}
            className="mt-10 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full">
        <header className="flex justify-between items-center bg-gray-900 dark:bg-gray-800 px-6 py-4 shadow-md">
          <button
            className="text-2xl"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <span className="font-medium text-gray-800 dark:text-white">
            Welcome, {user?.role === 'superadmin' ? 'Super Admin' : user?.name}
          </span>

          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
