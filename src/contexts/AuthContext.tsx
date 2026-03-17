"use client";

// Authentication context for application

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { atApiService, AuthSession } from "../lib/atproto";
import { useRouter } from "next/navigation";

// Authentication context interface
interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
}

// Authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialise session
  useEffect(() => {
    const initSession = async () => {
      try {
        const storedSessionStr = localStorage.getItem("atp_session");
        if (storedSessionStr) {
          const storedSession: AuthSession = JSON.parse(storedSessionStr);
          await atApiService.resumeSession(storedSession);
          if (atApiService.agent.session) {
            setSession(atApiService.agent.session);
          } else {
            setSession(storedSession);
          }
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

  // Login function
  const login = (newSession: AuthSession) => {
    setSession(newSession);
    localStorage.setItem("atp_session", JSON.stringify(newSession));
  };

  // Logout function
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

// Use authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
