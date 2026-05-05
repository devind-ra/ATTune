// CommentModal component
// Contains the following:
// - ReviewItem to view comments on review
// - Closing review modal on escape key

"use client";

import { useEffect } from "react";
import ReviewItem from "./ReviewItem";
import { ReviewComments } from "./ReviewComments";
import { MusicReview } from "@/lib/atproto";
import { AppBskyActorDefs } from "@atproto/api";

// props for comment modal component
interface CommentModalProps {
  item: {
    uri: string;
    value: MusicReview;
    author?: string | AppBskyActorDefs.ProfileViewBasic;
  };
  onClose: () => void;
  onDelete: (uri: string) => void;
  onEdit: (uri: string, data: Partial<MusicReview>) => Promise<void>;
  isReadOnly?: boolean;
}

export function CommentModal({
  item,
  onClose,
  onDelete,
  onEdit,
  isReadOnly,
}: CommentModalProps) {
  // closing comment modal using event listener for escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // content called to allow for comment modal to present review with comments
  // review can be edited or deleted if it belongs to the user
  // comment modal can be closed using 'X' or using the escape key
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900/50 /70 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-700 transition-colors z-10 cursor-pointer"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="p-6 pr-12 pt-12 sm:pr-6 sm:pt-6">
          <ReviewItem
            item={item}
            onDelete={(uri) => {
              onDelete(uri);
              onClose();
            }}
            onEdit={onEdit}
            isReadOnly={isReadOnly}
          />

          <ReviewComments
            postUri={item.value.postUri}
            postCid={item.value.postCid}
          />
        </div>
      </div>
    </div>
  );
}
