// AuthForm Component
// Contains the following:
// - Auth form function to handle authentication
// - Modals for help and signup

"use client";

import { useState } from "react";
import { useAuthForm } from "@/app/hooks/useAuthForm";
import { AuthModals } from "./AuthModals";

type ModalType = "help" | "signup" | null;

interface AuthFormProps {
  onLogin: () => void;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  } = useAuthForm(onLogin);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

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
            <br />
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
      <AuthModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
