// useWipeData hook
// Contains the following:
// - Handling wipe data logic

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { atApiService } from "@/lib/atproto";

export function useWipeData() {
  const { session } = useAuth();
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleWipeData = async (onSuccess: () => void) => {
    if (!session) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await atApiService.login(session.handle, password);
      const reviews = await atApiService.getReviews(session.did);
      await Promise.all(reviews.map((r) => atApiService.deleteReview(r.uri)));
      await atApiService.deleteTastes();
      onSuccess();
    } catch {
      setDeleteError("Invalid password or failed to delete data.");
    } finally {
      setIsDeleting(false);
    }
  };

  return { password, setPassword, isDeleting, deleteError, handleWipeData };
}
