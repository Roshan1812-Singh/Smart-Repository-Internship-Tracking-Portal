const Loader = ({ className = "" }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900/80 ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <div className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
        Loading...
      </div>
    </div>
  );
};

export default Loader;
