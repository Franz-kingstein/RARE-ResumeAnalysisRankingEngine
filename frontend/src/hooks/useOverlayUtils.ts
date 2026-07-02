import { useEffect } from "react";

/**
 * useOutsideClick
 *
 * Calls `handler` when a mousedown event is detected outside of the provided
 * `ref` element. Pass `enabled` to conditionally activate the listener.
 */
export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [ref, handler, enabled]);
}

/**
 * useEscapeKey
 *
 * Calls `handler` when the Escape key is pressed while `enabled` is true.
 */
export function useEscapeKey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handler();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handler, enabled]);
}
