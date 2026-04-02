import React from 'react';

const HeroHeader = ({ title, subtitle }) => (
  <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-800 rounded-3xl p-12 shadow-2xl overflow-hidden mb-12">
    {/* Background pattern */}
    <div className="absolute inset-0 bg-[radial-gradient(var(--tw-gradient-stops))] opacity-20" />
    <div className="absolute inset-0 bg-grid-slate-900/20 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_-20%,white,transparent)]" />
    
    <div className="relative z-10 text-white text-center">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 leading-tight">
        {title}
      </h1>
      <p className="text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto leading-relaxed">
        {subtitle}
      </p>
      
      {/* Animated dots */}
      <div className="flex gap-2 justify-center mt-12">
        <div className="w-4 h-4 bg-white/30 rounded-full animate-bounce [animation-delay:-0.2s]" />
        <div className="w-4 h-4 bg-white/50 rounded-full animate-bounce" />
        <div className="w-4 h-4 bg-white/30 rounded-full animate-bounce [animation-delay:0.2s]" />
      </div>
    </div>
    
    {/* Floating shapes */}
    <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
    <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl rotate-12 animate-spin-slow" />
  </div>
);

export default HeroHeader;

