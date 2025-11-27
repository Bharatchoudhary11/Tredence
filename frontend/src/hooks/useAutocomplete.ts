import { useEffect, useRef, useState } from "react";

import { apiBaseUrl } from "../utils/config";

interface AutocompleteResult {
  suggestion: string;
  loading: boolean;
}

export function useAutocomplete(
  code: string,
  cursorPosition: number,
): AutocompleteResult {
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<number>();
  const controllerRef = useRef<AbortController>();

  useEffect(() => {
    if (!code.trim()) {
      setSuggestion("");
      return;
    }

    timeoutRef.current && window.clearTimeout(timeoutRef.current);
    controllerRef.current?.abort();

    timeoutRef.current = window.setTimeout(async () => {
      setLoading(true);
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const response = await fetch(`${apiBaseUrl}/autocomplete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            cursorPosition,
            language: "python",
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Autocomplete failed");
        }
        const data = await response.json();
        setSuggestion(data.suggestion);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => {
      timeoutRef.current && window.clearTimeout(timeoutRef.current);
      controllerRef.current?.abort();
    };
  }, [code, cursorPosition]);

  return { suggestion, loading };
}
