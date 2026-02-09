'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthForm from "../components/AuthForm";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      router.push('/home');
    }
  }, [session, isLoading, router]);

  const handleLogin = () => {
    router.push('/home');
  };

  const scrollToLogin = () => {
    document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading || session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-sky-500/30">

      <section className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="text-center z-10 max-w-4xl px-6">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-in-expand mb-6 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent pb-2">
            ATtune
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-zinc-800 dark:text-zinc-100 mb-6">
            Decentralised Music. Real Connections.
          </p>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Join the revolution of music discovery. Rate, review, and discuss your favourite tracks through the use of the AT Protocol. Own your data, find your rhythm.
          </p>

          <button
            onClick={scrollToLogin}
            className="px-8 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Get Started
          </button>
        </div>

        <div className="absolute bottom-10 animate-bounce cursor-pointer" onClick={scrollToLogin}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </section>

      <section id="login-section" className="min-h-screen w-full flex flex-col items-center justify-center py-20 px-6 bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Welcome to the Community</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Sign in with your Bluesky account to continue.</p>
          </div>

          <AuthForm onLogin={handleLogin} />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="font-bold text-lg mb-1 dark:text-white">Rate</div>
              <p className="text-sm text-zinc-500">Share your opinion on albums and tracks.</p>
            </div>
            <div className="p-4">
              <div className="font-bold text-lg mb-1 dark:text-white">Review</div>
              <p className="text-sm text-zinc-500">Write in-depth reviews and gain a following.</p>
            </div>
            <div className="p-4">
              <div className="font-bold text-lg mb-1 dark:text-white">Connect</div>
              <p className="text-sm text-zinc-500">Find users with similar taste in music.</p>
            </div>
          </div>

          <footer className="mt-20 text-center text-zinc-400 text-sm">
            <p>&copy; {new Date().getFullYear()} ATtune. Built with AT Protocol.</p>
          </footer>
        </div>
      </section>

    </div>
  );
}
