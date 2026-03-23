// HeroSection component
// Contains the following:
// - Hero section with title, description, and call to action button

interface Props {
  onScrollToLogin: () => void;
}

export function HeroSection({ onScrollToLogin }: Props) {
  return (
    <section className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="text-center z-10 max-w-4xl px-6">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-in-expand mb-6 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent pb-2">
          ATtune
        </h1>
        <p className="text-2xl md:text-3xl font-medium text-zinc-800 dark:text-zinc-100 mb-6">
          Decentralised Music. Real Connections.
        </p>
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10">
          Join the revolution of music discovery. Rate, review, and discuss your
          favourite tracks through the use of the AT Protocol. Own your data,
          find your rhythm.
        </p>
        <button
          onClick={onScrollToLogin}
          className="px-8 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Get Started
        </button>
      </div>

      <div
        className="absolute bottom-10 animate-bounce cursor-pointer"
        onClick={onScrollToLogin}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 text-zinc-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </section>
  );
}
