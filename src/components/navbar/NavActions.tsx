// NavActions component
// Contains the following:
// - Navigation actions for the application

interface Props {
  onLogout: () => void;
}

export function NavActions({ onLogout }: Props) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
      <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400 w-full md:w-auto">
        <a
          href="/profile"
          className="hover:text-sky-500 transition-colors w-full md:w-auto text-center md:text-left py-2 md:py-0"
        >
          Profile
        </a>
        <a
          href="/explore"
          className="hover:text-sky-500 transition-colors w-full md:w-auto text-center md:text-left py-2 md:py-0"
        >
          Explore
        </a>
      </nav>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => location.replace("/record")}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer w-full sm:w-auto"
        >
          <svg
            className="h-3 w-3 animate-pulse"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="6" />
          </svg>
          Record
        </button>
        <button
          onClick={onLogout}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer w-full sm:w-auto py-2 md:py-0"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
