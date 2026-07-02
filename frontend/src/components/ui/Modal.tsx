import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable modal overlay.
 * - Clicking the backdrop OR the × button closes the modal.
 * - ESC key closes the modal.
 * - Locks body scroll while open.
 */
export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // ESC key support
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl2 border border-violet-100 bg-white shadow-pop",
          "animate-modal-in",
          className,
        )}
        role="dialog"
        aria-modal
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-violet-100 px-5 py-4">
          <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-violet-50 hover:text-ink"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
