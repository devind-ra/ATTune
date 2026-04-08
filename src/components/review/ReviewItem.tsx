// ReviewItem Component
// Contains the following:
// - Displays a single review
// - Allows user to edit or delete a review

"use client";

import { useState } from "react";
import Link from "next/link";
import { MusicReview } from "@/lib/atproto";
import ReviewEditForm from "./ReviewEditForm";

interface ReviewItemProps {
  item: { uri: string; value: MusicReview };
  onDelete: (uri: string) => void;
  onEdit: (uri: string, data: Partial<MusicReview>) => Promise<void>;
  onClick?: () => void;
}

// eslint-disable-next-line max-lines-per-function
export default function ReviewItem({
  item,
  onDelete,
  onEdit,
  onClick,
}: ReviewItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MusicReview>>({});

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({
      subjectTitle: item.value.subjectTitle,
      subjectArtist: item.value.subjectArtist,
      rating: item.value.rating,
      text: item.value.text || "",
      listenedAt: item.value.listenedAt,
    });
  };

  const submitEdit = async () => {
    if (
      !editForm.subjectTitle ||
      !editForm.subjectArtist ||
      !editForm.rating ||
      !editForm.listenedAt
    ) {
      return;
    }
    await onEdit(item.uri, editForm);
    setIsEditing(false);
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-shadow ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
      onClick={(e) => {
        if (!onClick) return;
        if ((e.target as HTMLElement).closest("button, a, input, textarea"))
          return;
        onClick();
      }}
    >
      {isEditing ? (
        <ReviewEditForm
          editForm={editForm}
          onChange={setEditForm}
          onSave={submitEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <div>
              <Link
                href={`/album/${encodeURIComponent(item.value.subjectArtist)}/${encodeURIComponent(item.value.subjectTitle)}`}
                className="hover:underline decoration-zinc-400 dark:decoration-zinc-500"
              >
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {item.value.subjectTitle}
                </h4>
              </Link>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                by{" "}
                <Link
                  href={`/artist/${encodeURIComponent(item.value.subjectArtist)}`}
                  className="hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 px-1 -mx-1 rounded transition-colors"
                >
                  {item.value.subjectArtist}
                </Link>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">★</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {item.value.rating / 2}
                </span>
              </div>
              <div className="flex space-x-3 text-xs">
                <button
                  onClick={handleEditClick}
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.uri)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {item.value.text && (
            <p className="text-zinc-700 dark:text-zinc-300 mt-2 text-sm leading-relaxed">
              {item.value.text}
            </p>
          )}

          <div className="mt-4 text-xs text-zinc-400">
            Listened on{" "}
            {new Date(
              item.value.listenedAt || item.value.createdAt,
            ).toLocaleDateString()}
          </div>
        </>
      )}
    </div>
  );
}
