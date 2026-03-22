// StarRating component
// Contains the following:
// - Displays a star rating
// - Allows user to rate an album using points from 0.5 to 5 stars

"use client";

import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
}

interface StarProps {
  index: number;
  activeScore: number;
  interactive: boolean;
  onHover: (rating: number) => void;
  onClick: (rating: number) => void;
}

const STAR_PATH =
  "M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z";

export default function StarRating({
  rating,
  onChange,
  interactive = true,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const activeRating =
    hoveredRating > 0 && interactive ? hoveredRating / 2 : rating / 2;

  return (
    <div
      className="flex gap-1"
      onMouseLeave={() => interactive && setHoveredRating(0)}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <Star
          key={starIndex}
          index={starIndex}
          activeScore={activeRating}
          interactive={interactive}
          onHover={setHoveredRating}
          onClick={(val) => onChange?.(val)}
        />
      ))}
    </div>
  );
}

function Star({
  index,
  activeScore,
  interactive,
  onHover,
  onClick,
}: StarProps) {
  const isFull = index <= activeScore;
  const isHalf = index - 0.5 === activeScore;

  return (
    <div
      className={`relative w-8 h-8 ${interactive ? "cursor-pointer group" : ""}`}
    >
      <StarSvg
        className={`text-zinc-300 dark:text-zinc-600 ${interactive ? "transition-transform group-hover:scale-110" : ""}`}
      />

      {(isFull || isHalf) && (
        <div
          className={`absolute top-0 left-0 h-full overflow-hidden pointer-events-none ${interactive ? "transition-transform group-hover:scale-110" : ""} ${isHalf ? "w-1/2" : "w-full"}`}
        >
          <StarSvg className="text-yellow-400 dark:text-yellow-500" />
        </div>
      )}

      {interactive && (
        <div className="absolute inset-0 flex">
          <div
            className="w-1/2 h-full z-10"
            onMouseEnter={() => onHover((index - 0.5) * 2)}
            onClick={() => onClick((index - 0.5) * 2)}
          />
          <div
            className="w-1/2 h-full z-10"
            onMouseEnter={() => onHover(index * 2)}
            onClick={() => onClick(index * 2)}
          />
        </div>
      )}
    </div>
  );
}

function StarSvg({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`w-8 h-8 ${className}`}
    >
      <path fillRule="evenodd" d={STAR_PATH} clipRule="evenodd" />
    </svg>
  );
}
