import { motion } from 'framer-motion';

const StarRating = ({ rating = 0, onChange, readonly = false, size = "lg" }) => {
  const starSize = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(10)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <motion.button
            key={index}
            type="button"
            onClick={() => !readonly && onChange(starValue)}
            whileHover={{ scale: 1.3, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`
              ${starSize}
            } text-yellow-400 transition-all duration-200 cursor-pointer ${
              readonly ? 'hover:scale-100' : 'hover:scale-130 hover:text-yellow-500'
            } ${
              isFilled ? 'fill-current shadow-lg drop-shadow-lg' : 'text-yellow-200'
            }`}
          >
            ★
          </motion.button>
        );
      })}
      <span className={`ml-3 font-bold text-sm ${
        rating >= 8 ? 'text-emerald-600' : rating >= 6 ? 'text-amber-600' : 'text-rose-600'
      }`}>
        {rating}/10
      </span>
    </div>
  );
};

export default StarRating;
