import React from "react";
import { motion } from "framer-motion"; 

const Timeline = ({ items, events }) => {
  const timelineData = events || items || [];

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded-full" />

      <div className="space-y-8">
        {timelineData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-start gap-6 group"
          >
            <div className="relative z-10">
              <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm -mt-0.5">
                {item.icon || index + 1}
              </div>
            </div>

            <div className="flex-1">
              <div
                className={`inline-flex px-4 py-2 rounded-full text-xs font-bold mb-2 ${
                  item.status === "approved"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 border"
                    : item.status === "rejected"
                      ? "bg-red-100 text-red-800 border-red-300 border"
                      : "bg-yellow-100 text-yellow-800 border-yellow-300 border"
                }`}
              >
                {item.status?.toUpperCase()}
              </div>

              <h4 className="font-bold text-lg text-gray-300 mb-1">
                {item.title}
              </h4>

              <p className="text-gray-300 mb-2">{item.description}</p>

              <p className="text-xs text-gray-300">
                {item.date ? new Date(item.date).toLocaleDateString() : ""}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
