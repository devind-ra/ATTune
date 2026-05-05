// AuthContext
// Contains the following:
// - Contains the AuthProvider component which provides the auth context to the application
// - Contains the useAuth hook to be used alongside AuthProvider

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { atApiService, AuthSession } from "../lib/atproto";
import { useRouter } from "next/navigation";

const SESSION_KEY = "atp_session";

// setting the session key to retrieve session data from local storage
const storage = {
  get: (): AuthSession | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },
  set: (session: AuthSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear: () => {
    localStorage.removeItem(SESSION_KEY);
  },
};

// defining the auth context type
interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // constants to help with session management
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // restoring session if found in local storage
  const restoreSession = useCallback(async () => {
    try {
      const stored = storage.get();
      if (!stored) return router.push("/");

      await atApiService.resumeSession(stored);
      if (atApiService.agent.session) {
        setSession(atApiService.agent.session);
      } else {
        setSession(stored);
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      storage.clear();
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // logging in results in new session being stored in local storage
  const login = (newSession: AuthSession) => {
    storage.set(newSession);
    setSession(newSession);
  };

  // logging out clears the session in local storage and removes session key
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

  // returning the auth context to be used in the application to enforce session management
  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  // function used to help with session management throughout application
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
