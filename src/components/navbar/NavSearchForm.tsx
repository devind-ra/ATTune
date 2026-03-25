// NavSearchForm component
// Contains the following:
// - Search form for searching artists, albums, and songs

interface Props {
  searchQuery: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

const SearchIcon = () => (
  <svg
    className="h-4 w-4 text-zinc-400 group-focus-within:text-sky-500 transition-colors"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

export function NavSearchForm({
  searchQuery,
  onChange,
  onSubmit,
  className = "",
}: Props) {
  return (
    <form onSubmit={onSubmit} className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search artists, albums..."
        className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full leading-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-all shadow-sm"
      />
    </form>
  );
}
