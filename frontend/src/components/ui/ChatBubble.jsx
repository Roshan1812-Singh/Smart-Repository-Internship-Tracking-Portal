import { motion } from 'framer-motion';

const ChatBubble = ({ message, isOwn, type }) => {
  const bubbleColors = {
    general: {
      own: 'bg-gradient-to-r from-primary to-secondary',
      other: 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800'
    },
    feedback: {
      own: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      other: 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50'
    }
  };

  const colorScheme = bubbleColors[type] || bubbleColors.general;
  const bgColor = isOwn ? colorScheme.own : colorScheme.other;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`max-w-[70%] p-5 rounded-3xl shadow-xl ${bgColor} text-white relative mr-0 ml-auto ${isOwn ? 'ml-auto rounded-br-sm' : 'rounded-bl-sm mr-auto'} backdrop-blur-xl border border-white/20`}
    >
      <p className="text-sm leading-relaxed break-words">{message}</p>
      <div className="absolute bottom-2 right-2 text-xs opacity-75 text-shadow-sm">
        {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </div>
      
      {/* Bubble tail */}
      <div className={`absolute bottom-0 ${isOwn ? '-right-3' : '-left-3'} w-6 h-6 bg-gradient-to-r from-transparent to-white rotate-45 shadow-lg opacity-80`} />
    </motion.div>
  );
};

export default ChatBubble;
