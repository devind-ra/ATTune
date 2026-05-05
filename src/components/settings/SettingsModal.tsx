// SettingsModal component
// Contains the following:
// - Modal for permanent data deletion
// - Password input on modal

"use client";

import { useWipeData } from "@/app/hooks/useWipeData";

// props passed to settings modal
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// eslint-disable-next-line max-lines-per-function
export default function SettingsModal({ isOpen, onClose }: Props) {
  // constants for handling settings modal
  const { password, setPassword, isDeleting, deleteError, handleWipeData } =
    useWipeData();

  if (!isOpen) return null;

  // content called to ensure modal is presented to user for password input
  // handleWipeData used to wipe data after password confirmation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl border border-zinc-800 overflow-hidden transform transition-all p-6">
        <h3 className="text-2xl font-bold text-zinc-100 mb-2">
          Are you absolutely sure?
        </h3>
        <p className="text-zinc-400 mb-6 text-sm">
          This will delete all of your reviews and tastes from the AT Protocol
          network permanently. Please enter your password to confirm.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-900/50 text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder="Enter your password"
              autoFocus
            />
          </div>

          {deleteError && (
            <p className="text-red-500 text-sm font-medium">{deleteError}</p>
          )}
        </div>

        <div className="mt-8 flex gap-3 justify-end">
          <button
            onClick={() => {
              setPassword("");
              onClose();
            }}
            disabled={isDeleting}
            className="px-4 py-2 text-zinc-400 hover:bg-zinc-800 font-medium rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleWipeData(() => {
                alert("All tastes and reviews have been permanently deleted.");
                onClose();
              })
            }
            disabled={!password || isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isDeleting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isDeleting ? "Deleting..." : "Permanently Wipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
