export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">

        <p className="text-sm">
          © {new Date().getFullYear()} SRITP Portal
        </p>

        <div className="flex gap-6 mt-4 md:mt-0 text-sm">
          <a href="/privacy" className="hover:text-white">Privacy Policy</a>
          <a href="/terms" className="hover:text-white">Terms</a>
          <a href="/contact" className="hover:text-white">Contact</a>
        </div>

      </div>
    </footer>
  );
}
