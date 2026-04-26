// ReviewEditForm component
// Contains the following:
// - Form for editing reviews
// - Contains album title, artist, rating, date listened and review text

"use client";

import { MusicReview } from "@/lib/atproto";
import StarRating from "./StarRating";

interface ReviewEditFormProps {
  editForm: Partial<MusicReview>;
  onChange: (form: Partial<MusicReview>) => void;
  onSave: () => void;
  onCancel: () => void;
}

// eslint-disable-next-line max-lines-per-function
export default function ReviewEditForm({
  editForm,
  onChange,
  onSave,
  onCancel,
}: ReviewEditFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-300">
          Album Title
        </label>
        <input
          type="text"
          value={editForm.subjectTitle || ""}
          onChange={(e) =>
            onChange({ ...editForm, subjectTitle: e.target.value })
          }
          className="w-full p-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 outline-none opacity-50 cursor-not-allowed"
          disabled
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-300">
          Artist
        </label>
        <input
          type="text"
          value={editForm.subjectArtist || ""}
          onChange={(e) =>
            onChange({ ...editForm, subjectArtist: e.target.value })
          }
          className="w-full p-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 outline-none opacity-50 cursor-not-allowed"
          disabled
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 text-zinc-300">
          Rating ({(editForm.rating || 10) / 2}/5)
        </label>
        <StarRating
          rating={editForm.rating || 10}
          onChange={(newRating) => onChange({ ...editForm, rating: newRating })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-300">
          Date Listened
        </label>
        <input
          type="date"
          value={
            editForm.listenedAt
              ? new Date(editForm.listenedAt).toISOString().split("T")[0]
              : ""
          }
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            onChange({
              ...editForm,
              listenedAt: e.target.value
                ? new Date(e.target.value).toISOString()
                : undefined,
            })
          }
          className="w-full p-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-300">
          Review
        </label>
        <textarea
          value={editForm.text || ""}
          onChange={(e) => onChange({ ...editForm, text: e.target.value })}
          className="w-full p-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] cursor-pointer"
        />
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-zinc-700 text-zinc-100 font-medium rounded-lg hover:bg-zinc-600 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
