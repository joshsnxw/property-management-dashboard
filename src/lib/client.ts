type ToastFn = (message: string, type: "success" | "error" | "info") => void;

/**
 * Thin fetch wrapper that handles non-ok responses and network errors by
 * calling toast with the server's error message (or errorMessage fallback).
 *
 * Returns parsed JSON on success, or null on any failure (the error is
 * already toasted so callers just guard with `if (!result) return`).
 *
 * For 204 No Content responses (e.g. DELETE) a non-null empty object is
 * returned so callers can distinguish success from failure with the same
 * null-check pattern.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit,
  toast: ToastFn,
  errorMessage = "Something went wrong",
): Promise<T | null> {
  try {
    const res = await fetch(url, options);

    if (res.status === 204) return {} as unknown as T;

    if (!res.ok) {
      let message = errorMessage;
      try {
        const data = await res.json();
        if (data.error) message = data.error;
      } catch { /* ignore parse errors on error responses */ }
      toast(message, "error");
      return null;
    }

    return res.json();
  } catch {
    toast("Network error", "error");
    return null;
  }
}
