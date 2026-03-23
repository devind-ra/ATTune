// LoginSection component
// Contains the following:
// - Login form

import AuthForm from "../authentication/AuthForm";

interface Props {
  onLogin: () => void;
}

const FEATURES = [
  { label: "Rate", description: "Share your opinion on albums and tracks." },
  {
    label: "Review",
    description: "Write in-depth reviews and gain a following.",
  },
  { label: "Connect", description: "Find users with similar taste in music." },
] as const;

export function LoginSection({ onLogin }: Props) {
  return (
    <section
      id="login-section"
      className="min-h-screen w-full flex flex-col items-center justify-center py-20 px-6 bg-zinc-50 dark:bg-black"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Welcome to the Community
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Sign in with your Bluesky account to continue.
          </p>
        </div>

        <AuthForm onLogin={onLogin} />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {FEATURES.map(({ label, description }) => (
            <div key={label} className="p-4">
              <div className="font-bold text-lg mb-1 dark:text-white">
                {label}
              </div>
              <p className="text-sm text-zinc-500">{description}</p>
            </div>
          ))}
        </div>

        <footer className="mt-20 text-center text-zinc-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} ATtune. Built with AT Protocol.
          </p>
        </footer>
      </div>
    </section>
  );
}
