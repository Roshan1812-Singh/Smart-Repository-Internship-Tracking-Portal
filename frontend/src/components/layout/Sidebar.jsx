import { Link } from "react-router-dom";
import { Home, Users, BarChart } from "lucide-react";

export default function Sidebar({ isOpen }) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 shadow-md h-screen p-5 transition-all duration-300 ${
        isOpen ? "w-64" : "w-0 overflow-hidden"
      }`}
    >
      <div className="flex flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 hover:text-blue-600">
          <Home size={18} /> Home
        </Link>

        <Link to="/admin" className="flex items-center gap-2 hover:text-blue-600">
          <BarChart size={18} /> Admin Dashboard
        </Link>

        <Link to="/student" className="flex items-center gap-2 hover:text-blue-600">
          <Users size={18} /> Student Dashboard
        </Link>
      </div>
    </div>
  );
}
