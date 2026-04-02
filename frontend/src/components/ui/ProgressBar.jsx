const ProgressBar = ({ value = 0, label = "", color = "bg-blue-500" }) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{Math.round(value)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
        <div
          className={`h-3 rounded-full transition-all duration-300 bg-gradient-to-r ${color} shadow-md`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

