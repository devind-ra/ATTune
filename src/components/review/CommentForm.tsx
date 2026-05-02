// CommentForm component
// Contains the following:
// - Form for comment submission

interface CommentFormProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string;
}

export function CommentForm({
  value,
  onChange,
  onSubmit,
  submitting,
  error,
}: CommentFormProps) {
  return (
    <>
      {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <label htmlFor="comment-input" className="sr-only">
          Add a comment
        </label>
        <textarea
          id="comment-input"
          name="comment-form"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
          disabled={submitting}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !value.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </>
  );
}
