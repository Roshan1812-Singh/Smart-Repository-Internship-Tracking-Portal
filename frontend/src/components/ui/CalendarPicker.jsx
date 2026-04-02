import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CalendarPicker = ({ value, onChange, placeholder = "Select deadline" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div 
        className="w-full p-4 pl-12 bg-gradient-to-r from-white/70 to-gray-50/70 dark:from-gray-800/70 dark:to-gray-900/70 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl backdrop-blur-sm shadow-lg cursor-pointer hover:shadow-xl hover:border-primary/40 transition-all duration-300 focus-within:ring-4 focus-within:ring-primary/20 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <input
          type="date"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(false);
          }}
          className="w-full bg-transparent border-none outline-none text-lg font-semibold text-gray-300 placeholder-gray-500 cursor-pointer focus:ring-0 p-0"
          placeholder={placeholder}
        />
      </div>

      {/* Date picker calendar - simplified */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-500 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-20 p-4"
        >
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-900 mb-4">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          {/* Simplified calendar grid - in production use date-fns or dayjs */}
          <div className="grid grid-cols-7 gap-2 text-lg">
            {[...Array(35)].map((_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl font-bold transition-all h-14 flex items-center justify-center ${
                  i % 7 === 0 ? 'text-gray-400' : 'text-gray-900 hover:bg-primary/20 hover:text-primary'
                }`}
                onClick={() => {
                  const date = new Date();
                  date.setDate(i % 30 + 1);
                  const formatted = date.toISOString().split('T')[0];
                  onChange(formatted);
                  setIsOpen(false);
                }}
              >
                {i % 7 === 0 ? '' : (i % 30 + 1)}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CalendarPicker;

