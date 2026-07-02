import { X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}



function getFirstName(name: string): string {
  return name.split(" ")[0];
}
function getLastName(name: string): string {
  const parts = name.split(" ");
  return parts.length > 1 ? parts.slice(1).join(" ") : "";
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/25 backdrop-blur-sm" onClick={onClose} aria-hidden />

      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-xl2 border border-violet-100 bg-white shadow-pop animate-modal-in"
        role="dialog"
        aria-modal
        aria-label="My Profile"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-violet-100 px-5 py-4">
          <h3 className="font-display text-base font-semibold text-ink">My Profile</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-violet-50 hover:text-ink"
            aria-label="Close profile"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Avatar + identity */}
          <div className="flex items-center gap-4 border-b border-violet-50 pb-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-lg font-bold text-white shadow-sm">
              {user.initials}
            </div>
            <div>
              <h4 className="font-semibold text-ink">{user.name}</h4>
              <p className="text-sm text-ink/50">{user.designation}</p>
              <p className="text-[11px] text-ink/40 mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/60">First Name</label>
              <input
                readOnly
                value={getFirstName(user.name)}
                className="w-full rounded-lg border border-violet-100 bg-cream-50/50 px-3 py-2 text-sm text-ink/70 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/60">Last Name</label>
              <input
                readOnly
                value={getLastName(user.name)}
                className="w-full rounded-lg border border-violet-100 bg-cream-50/50 px-3 py-2 text-sm text-ink/70 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">Work Email</label>
            <input
              readOnly
              value={user.email}
              className="w-full rounded-lg border border-violet-100 bg-cream-50/50 px-3 py-2 text-sm text-ink/70 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/60">Role</label>
              <input
                readOnly
                value={user.role}
                className="w-full rounded-lg border border-violet-100 bg-cream-50/50 px-3 py-2 text-sm text-ink/70 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/60">Department</label>
              <input
                readOnly
                value={user.department}
                className="w-full rounded-lg border border-violet-100 bg-cream-50/50 px-3 py-2 text-sm text-ink/70 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">Designation</label>
            <input
              readOnly
              value={user.designation}
              className="w-full rounded-lg border border-violet-100 bg-cream-50/50 px-3 py-2 text-sm text-ink/70 focus:outline-none"
            />
          </div>

          {/* Account type */}
          <div className="flex items-center justify-between rounded-lg bg-violet-50 px-3 py-2">
            <span className="text-xs font-semibold text-violet-700">Account Type</span>
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
              user.role === "Administrator"
                ? "bg-violet-500 text-white"
                : "bg-orchid-500/10 text-orchid-600",
            )}>
              {user.role}
            </span>
          </div>

          <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            <strong>Demo Mode:</strong> Profile edits are disabled.
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
