const StatCard = ({ title, value, color, icon }) => (
  <div className="group bg-gradient-to-br from-white/80 to-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
    {/* Animated background */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -rotate-1 scale-110" />
    
    <div className="relative z-10">
      <div className={`inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-4 text-sm font-medium text-white/90 ${color}`}>
        <span className={`w-3 h-3 rounded-full mr-2 ${icon}`} />
        {title}
      </div>
      
      <div className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2 transform group-hover:scale-110 transition-transform">
        {value}
      </div>
      
      <div className="text-sm text-white/70 font-medium tracking-wide uppercase">Active</div>
    </div>
    
    {/* Shine effect */}
    <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-yellow-400/20 to-transparent rounded-full blur-xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

export default StatCard;

