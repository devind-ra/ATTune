"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { atApiService, AuthSession } from "../lib/atproto";
import { useRouter } from "next/navigation";

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initSession = async () => {
      try {
        const storedSessionStr = localStorage.getItem("atp_session");
        if (storedSessionStr) {
          const storedSession: AuthSession = JSON.parse(storedSessionStr);
          await atApiService.resumeSession(storedSession);
          setSession(storedSession);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Failed to resume session:", error);
        localStorage.removeItem("atp_session");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [router]);

  const login = (newSession: AuthSession) => {
    setSession(newSession);
    localStorage.setItem("atp_session", JSON.stringify(newSession));
  };

  const logout = async () => {
    try {
      await atApiService.agent.logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
    setSession(null);
    localStorage.removeItem("atp_session");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
