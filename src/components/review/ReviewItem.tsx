// ReviewItem Component
// Contains the following:
// - Displays a single review
// - Allows user to edit or delete a review
// - Differentiating between read-only reviews and CRUD action reviews
// - Displays like count and allows user to like or unlike a review

"use client";

import { useState } from "react";
import Link from "next/link";
import { MusicReview } from "@/lib/atproto";
import { AppBskyActorDefs } from "@atproto/api";
import ReviewEditForm from "./ReviewEditForm";
import { usePostMetrics } from "@/app/hooks/usePostMetrics";

interface ReviewItemProps {
  item: {
    uri: string;
    value: MusicReview;
    author?: string | AppBskyActorDefs.ProfileViewBasic;
  };
  onDelete: (uri: string) => void;
  onEdit: (uri: string, data: Partial<MusicReview>) => Promise<void>;
  onClick?: () => void;
  isReadOnly?: boolean;
}

function LikeButton({
  postUri,
  postCid,
}: {
  postUri?: string;
  postCid?: string;
}) {
  const { likeCount, hasLiked, toggleLike, loading } = usePostMetrics(
    postUri,
    postCid,
  );

  if (!postUri || !postCid) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleLike();
      }}
      disabled={loading}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer
        ${hasLiked
          ? "text-pink-400 bg-pink-950/30"
          : "text-zinc-500 hover:text-pink-600 hover:bg-pink-950/30"
        }`}
      title={hasLiked ? "Unlike review" : "Like review"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={hasLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={hasLiked ? "0" : "2"}
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {likeCount > 0 && <span>{likeCount}</span>}
    </button>
  );
}

// eslint-disable-next-line max-lines-per-function
export default function ReviewItem({
  item,
  onDelete,
  onEdit,
  onClick,
  isReadOnly,
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
      className={`bg-zinc-900 rounded-xl p-5 border border-zinc-800 shadow-sm transition-shadow ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
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
                className="hover:underline decoration-zinc-500"
              >
                <h4 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  {item.value.subjectTitle}
                </h4>
              </Link>
              <p className="text-sm text-zinc-400">
                by{" "}
                <Link
                  href={`/artist/${encodeURIComponent(item.value.subjectArtist)}`}
                  className="hover:text-sky-400 hover:bg-sky-50 px-1 -mx-1 rounded transition-colors"
                >
                  {item.value.subjectArtist}
                </Link>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">★</span>
                <span className="font-bold text-zinc-100">
                  {item.value.rating / 2}
                </span>
              </div>
              {!isReadOnly && (
                <div className="flex space-x-3 text-xs">
                  <button
                    onClick={handleEditClick}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.uri)}
                    className="text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {item.value.text && (
            <p className="text-zinc-300 mt-2 text-sm leading-relaxed">
              {item.value.text}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="text-xs text-zinc-400 shrink-0">
              Listened on{" "}
              {new Date(
                item.value.listenedAt || item.value.createdAt,
              ).toLocaleDateString()}
            </div>

            <div className="flex items-center gap-3">
              <LikeButton
                postUri={item.value.postUri}
                postCid={item.value.postCid}
              />

              {typeof item.author !== "string" && item.author?.handle && (
                <a
                  href={`https://bsky.app/profile/${item.author.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full hover:bg-zinc-700 hover:text-zinc-100 transition-colors shrink-0"
                  title="View Bluesky Profile"
                >
                  @{item.author.handle}
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
