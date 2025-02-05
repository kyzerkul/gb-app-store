import { useState } from 'react';

interface StarRatingProps {
  initialRating?: number;
  totalStars?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

export default function StarRating({
  initialRating = 0,
  totalStars = 5,
  onRatingChange,
  readOnly = false
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (index: number) => {
    if (!readOnly) {
      const newRating = index + 1;
      setRating(newRating);
      if (onRatingChange) {
        onRatingChange(newRating);
      }
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => !readOnly && setHover(starValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={`text-2xl ${!readOnly && 'cursor-pointer'}`}
            disabled={readOnly}
          >
            <svg
              className={`w-6 h-6 ${
                (hover || rating) >= starValue
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        );
      })}
      {!readOnly && (
        <span className="text-sm text-gray-600 ml-2">
          {rating > 0 ? `${rating} sur ${totalStars}` : 'Noter'}
        </span>
      )}
    </div>
  );
}
