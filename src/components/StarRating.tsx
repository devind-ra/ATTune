"use client";

import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
}

export default function StarRating({
  rating,
  onChange,
  interactive = true,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div
      className="flex gap-1"
      onMouseLeave={() => interactive && setHoveredRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isTarget =
          hoveredRating > 0 && interactive ? hoveredRating / 2 : rating / 2;
        const isFull = star <= isTarget;
        const isHalf = star - 0.5 === isTarget;

        return (
          <div
            key={star}
            className={`relative w-8 h-8 ${interactive ? "cursor-pointer group" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-8 h-8 text-zinc-300 dark:text-zinc-600 ${
                interactive ? "transition-transform group-hover:scale-110" : ""
              }`}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>

            {(isFull || isHalf) && (
              <div
                className={`absolute top-0 left-0 h-full overflow-hidden pointer-events-none ${
                  interactive
                    ? "transition-transform group-hover:scale-110"
                    : ""
                } ${isHalf ? "w-1/2" : "w-full"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-yellow-400 dark:text-yellow-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {interactive && onChange && (
              <div className="absolute inset-0 flex">
                <div
                  className="w-1/2 h-full z-10"
                  onMouseEnter={() => setHoveredRating((star - 0.5) * 2)}
                  onClick={() => onChange((star - 0.5) * 2)}
                />
                <div
                  className="w-1/2 h-full z-10"
                  onMouseEnter={() => setHoveredRating(star * 2)}
                  onClick={() => onChange(star * 2)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
