// HeroSection component
// Contains the following:
// - Hero section with title, description and call to action button

interface Props {
  onScrollToLogin: () => void;
}

export function HeroSection({ onScrollToLogin }: Props) {
  // content called to present HeroSection of landing page
  // displays main title, with description and way to scroll down to the login section
  return (
    <section className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-zinc-950">
      <div className="text-center z-10 max-w-4xl px-6">
        <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-in-expand mb-6 pb-2">
          ATtune
        </h1>
        <h2 className="text-2xl md:text-3xl font-medium text-zinc-100 mb-6">
          Decentralised Music. Own Your Data.
        </h2>
        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10">
          Join the revolution of music discovery. Have data ownership, share
          your opinions and discover more!
        </p>
        <button
          onClick={onScrollToLogin}
          className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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
