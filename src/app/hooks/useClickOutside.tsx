import { useEffect, useRef } from "react";

export function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  // ensures to handle event listener for clicking outside filter
  const ref = useRef<T>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  return ref;
}
