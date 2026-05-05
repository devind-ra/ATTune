// ReviewFormActions component
// Contains the following:
// - SpinnerIcon component
// - ReviewFormActions component (Cancel/Post Review buttons)

// SVG used to display spinner icon
const SpinnerIcon = () => (
  <svg
    className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// props used for review form actions
interface Props {
  loading: boolean;
  showCancel: boolean;
  onCancel: () => void;
}

export function ReviewFormActions({ loading, showCancel, onCancel }: Props) {
  // content called to allow user to cancel or submit review
  return (
    <div className="flex justify-end gap-3 pt-2">
      {showCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
      >
        {loading && <SpinnerIcon />}
        {loading ? "Posting..." : "Post Review"}
      </button>
    </div>
  );
}
