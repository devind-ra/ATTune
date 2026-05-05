// Landing page
// Contains the following:
// - Hero section
// - Login section
// - Footer

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { HeroSection } from "../components/landing/HeroSection";
import { LoginSection } from "../components/landing/LoginSection";

export default function LoginPage() {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  // uses authentication form to go to /home page
  useEffect(() => {
    if (!isLoading && session) router.push("/home");
  }, [session, isLoading, router]);

  // used to smoothly scroll to authentication form
  const scrollToLogin = () =>
    document
      .getElementById("login-section")
      ?.scrollIntoView({ behavior: "smooth" });

  if (isLoading || session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  // content called using smaller components
  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30">
      <HeroSection onScrollToLogin={scrollToLogin} />
      <LoginSection onLogin={() => router.push("/home")} />
    </div>
  );
}
