import { Menu, Moon, Sun, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ toggleSidebar }) {
  const [dark, setDark] = useState(false);
  const { logout, user } = useAuth();

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <Menu size={20} />
        </button>
        <h1 className="font-bold text-xl text-gray-800 dark:text-white">SRITP Portal</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          title="Toggle theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {user && (
          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
            title={`Logout (${user.name || user.email})`}
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
