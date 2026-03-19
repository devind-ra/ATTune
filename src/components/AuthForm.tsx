"use client";

import { useState } from "react";
import { atApiService } from "../lib/atproto";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

interface AuthFormProps {
  onLogin: () => void;
}

type ModalType = "help" | "signup" | null;

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const sessionData = await atApiService.login(identifier, password);
      login(sessionData);
      onLogin();
    } catch (err: unknown) {
      console.error("Login failed", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
          Sign in with Bluesky
        </h2>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
              Handle or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              placeholder="alice.bsky.social"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
              App Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              required
            />
            <button
              type="button"
              onClick={() => setActiveModal("help")}
              className="mt-1 text-xs text-sky-600 hover:text-sky-500 hover:underline cursor-pointer"
            >
              Where do I get this?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-4">
            Don&apos;t have an account?
            <br></br>
            <button
              type="button"
              onClick={() => setActiveModal("signup")}
              className="text-sky-600 hover:underline font-medium cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>

      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === "help" && (
              <>
                <h3 className="text-xl font-bold mb-4 dark:text-white">
                  How to get an App Password
                </h3>
                <div className="prose prose-sm dark:prose-invert space-y-3 text-zinc-600 dark:text-zinc-300">
                  <p>
                    To keep your account secure, you should use an App Password
                    instead of your main password.
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>
                      Go to{" "}
                      <Link
                        href="https://bsky.app/settings"
                        target="_blank"
                        className="text-sky-600 hover:underline"
                      >
                        Settings
                      </Link>{" "}
                      in Bluesky.
                    </li>
                    <li>
                      Scroll down to <strong>Privacy and Security</strong>.
                    </li>
                    <li>
                      Click on <strong>App passwords</strong>.
                    </li>
                    <li>
                      Click <strong>Add App Password</strong>.
                    </li>
                    <li>
                      Enter &quot;ATtune&quot; as the name and copy the code
                      (and save it somewhere safe!).
                    </li>
                  </ol>
                </div>
              </>
            )}

            {activeModal === "signup" && (
              <>
                <h3 className="text-xl font-bold mb-4 dark:text-white">
                  Join Bluesky
                </h3>
                <p className="mb-6 text-zinc-600 dark:text-zinc-300">
                  ATtune is built on the AT Protocol. To use ATtune, you need a
                  Bluesky account.
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Click on the button below to sign up for a Bluesky account.
                  </li>
                  <li>
                    After creating your account, come back here to sign in!
                  </li>
                </ol>
                <br></br>
                <div className="flex flex-col gap-3">
                  <Link
                    href="https://bsky.app/"
                    target="_blank"
                    className="block w-full text-center py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition-colors"
                  >
                    Go to bsky.app to Sign Up
                  </Link>
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
