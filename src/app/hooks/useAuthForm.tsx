// useAuthForm hook
// Contains the following:
// - Handles authentication

import { useState } from "react";
import { atApiService } from "@/lib/atproto";
import { useAuth } from "@/contexts/AuthContext";

export function useAuthForm(onLogin: () => void) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const sessionData = await atApiService.login(identifier, password);
      login(sessionData);
      onLogin();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  };
}
