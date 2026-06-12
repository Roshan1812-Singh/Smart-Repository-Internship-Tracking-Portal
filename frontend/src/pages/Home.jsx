import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-primary dark:bg-gradient-secondary">
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">SRITP</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <a
              href="#about"
              className="text-white hover:text-blue-200 transition"
            >
              About
            </a>
            <a
              href="#features"
              className="text-white hover:text-blue-200 transition"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-white hover:text-blue-200 transition"
            >
              How It Works
            </a>
            <Link
              to="/login"
              className="text-white hover:text-blue-200 transition"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <section className="text-center py-20 px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn text-white">
          Smart Repository & Internship Tracking Portal
        </h1>

        <p className="text-lg text-white/90 max-w-3xl mx-auto mb-10">
          SRITP is a comprehensive platform designed to streamline internship
          management for students, mentors, and administrators. Track
          applications, monitor progress, manage documents, and gain valuable
          insights through our intelligent dashboard system. Experience seamless
          collaboration between students and mentors with real-time updates and
          secure data management.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link
            to="/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Get Started as Student/Mentor
          </Link>
          <Link
            to="/register"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
          >
            Register as Student
          </Link>
          <Link
            to="/login?role=admin"
            className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
          >
            Admin Login
          </Link>

          <Link
            to="/superadmin-login"
            className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
          >
            Super Admin Login
          </Link>
        </div>
      </section>

      <section id="about" className="py-20 px-4 bg-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">About SRITP</h2>
          <p className="text-lg text-white/90 mb-8">
            SRITP (Smart Repository & Internship Tracking Portal) revolutionizes
            the way educational institutions manage internship programs. Our
            platform provides a centralized hub where students can apply for
            internships, mentors can guide their progress, and administrators
            can oversee the entire process with comprehensive analytics and
            reporting tools.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                For Students
              </h3>
              <p className="text-white/80">
                Apply, track, and manage internship opportunities with ease.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                For Mentors
              </h3>
              <p className="text-white/80">
                Guide students, review progress, and provide valuable feedback.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                For Admins
              </h3>
              <p className="text-white/80">
                Manage users, monitor activities, and generate insightful
                reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Real-Time Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor application status instantly with transparent updates
                and live notifications.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Smart Dashboards
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Interactive dashboards designed for students, mentors, and
                administrators with detailed analytics.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Secure & Centralized
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Everything managed in one secure portal with role-based access
                control and data protection.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Document Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload, verify, and manage internship-related documents securely
                with version control.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🔔</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with real-time notifications for application
                status, deadlines, and important updates.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Progress Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed progress tracking with milestones, feedback, and
                performance analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 bg-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Register & Apply
              </h3>
              <p className="text-white/80">
                Students register and submit internship applications with
                required documents.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Review & Assign
              </h3>
              <p className="text-white/80">
                Administrators review applications and assign mentors to guide
                students.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Track & Complete
              </h3>
              <p className="text-white/80">
                Mentors track progress, provide feedback, and students complete
                their internships.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-white font-semibold">SRITP</span>
          </div>
          <p className="text-white/70 text-sm">
            © 2024 Smart Repository & Internship Tracking Portal. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
