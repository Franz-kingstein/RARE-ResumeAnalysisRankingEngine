import { useState, useRef, useCallback, useEffect } from "react";
import {
  Search, Bell, Settings, LogOut, User, LifeBuoy,
  Shield, Palette, Keyboard, HelpCircle, BookOpen, Bug,
  Lightbulb, MessageSquare, ChevronDown,
} from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import type { Page } from "../types";
import { Modal } from "./ui/Modal";
import { cn } from "../utils/cn";
import { useOutsideClick, useEscapeKey } from "../hooks/useOverlayUtils";
import { useSettings } from "../hooks/useSettings";

// ─── Navigation tabs ──────────────────────────────────────────────────────────
const tabs: { key: Page; label: string }[] = [
  { key: "dashboard",  label: "Dashboard"  },
  { key: "candidates", label: "Candidates" },
  { key: "analytics",  label: "Analytics"  },
];

// ─── Overlay ID union ─────────────────────────────────────────────────────────
type OverlayId = "notifications" | "settings" | "profile" | null;

// ─── Support form state ───────────────────────────────────────────────────────
interface SupportForm {
  subject: string;
  category: string;
  message: string;
}

const EMPTY_FORM: SupportForm = { subject: "", category: "General Question", message: "" };

// ─── Component ────────────────────────────────────────────────────────────────
export default function Topbar() {
  const { state, dispatch } = useAppState();
  const activePage = state.activePage;

  // Search
  const [searchValue, setSearchValue] = useState(state.searchQuery);

  // Single active overlay — only one dropdown at a time
  const [openOverlay, setOpenOverlay] = useState<OverlayId>(null);

  // Modal state (Settings/profile/support/signout use full modals)
  const [activeModal, setActiveModal] = useState<"settings" | "support" | "profile" | "signout" | null>(null);

  // Support form
  const [supportForm, setSupportForm] = useState<SupportForm>(EMPTY_FORM);
  const [supportErrors, setSupportErrors] = useState<Partial<SupportForm>>({});
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Profile Form and Integration state
  const { settings, refresh: refreshSettings, updateSettings } = useSettings();
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState("");

  // Load settings on mount
  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Pre-fill profile modal fields when active modal opens
  useEffect(() => {
    if (settings && activeModal === "profile") {
      setProfileName(settings.name || "");
      setProfileEmail(settings.email || "");
      setProfileRole(settings.role || "");
    }
  }, [settings, activeModal]);

  const handleSaveProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim() || !profileRole.trim()) {
      dispatch({ type: "ADD_TOAST", payload: { type: "warning", title: "Missing fields", message: "Please fill in all profile fields." } });
      return;
    }
    try {
      await updateSettings({
        name: profileName,
        email: profileEmail,
        role: profileRole,
      });
      setActiveModal(null);
      dispatch({ type: "ADD_TOAST", payload: { type: "success", title: "Profile updated", message: "Profile settings saved successfully." } });
    } catch (err: any) {
      dispatch({ type: "ADD_TOAST", payload: { type: "error", title: "Update failed", message: err.message || "Failed to update profile." } });
    }
  };

  // Refs for overlay panels
  const notifRef  = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  // ── Overlay helpers ──────────────────────────────────────────────────────────
  const toggle = useCallback((id: OverlayId) => {
    setOpenOverlay(prev => prev === id ? null : id);
  }, []);

  const closeOverlay = useCallback(() => setOpenOverlay(null), []);

  // ESC closes whatever is open (overlay or modal)
  useEscapeKey(() => {
    if (openOverlay) { closeOverlay(); return; }
    if (activeModal) { setActiveModal(null); }
  }, !!(openOverlay || activeModal));

  // Click-outside for each panel
  useOutsideClick(notifRef,   closeOverlay, openOverlay === "notifications");
  useOutsideClick(settingsRef, closeOverlay, openOverlay === "settings");
  useOutsideClick(profileRef, closeOverlay, openOverlay === "profile");

  // ── Navigation ──────────────────────────────────────────────────────────────
  const navigate = (page: Page) => dispatch({ type: "SET_ACTIVE_PAGE", payload: page });

  const handleSearch = (val: string) => {
    setSearchValue(val);
    dispatch({ type: "SET_SEARCH_QUERY", payload: val });
    if (val.trim()) {
      dispatch({ type: "SET_ACTIVE_PAGE", payload: "candidates" });
    }
  };

  // ── Sign Out ─────────────────────────────────────────────────────────────────
  const handleSignOut = () => {
    setActiveModal(null);
    dispatch({ type: "RESET_DEMO" });
    dispatch({
      type: "ADD_TOAST",
      payload: { type: "success", title: "Signed out (Demo Mode)", message: "All session data cleared. Welcome back!" },
    });
  };

  // ── Support form ─────────────────────────────────────────────────────────────
  const validateSupport = (): boolean => {
    const errs: Partial<SupportForm> = {};
    if (!supportForm.subject.trim()) errs.subject = "Subject is required.";
    if (supportForm.message.trim().length < 10) errs.message = "Please describe your issue in at least 10 characters.";
    setSupportErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSupportSubmit = async () => {
    if (!validateSupport()) return;
    setSupportSubmitting(true);
    // Simulate network latency
    await new Promise(r => setTimeout(r, 1200));
    dispatch({
      type: "ADD_SUPPORT_TICKET",
      payload: { subject: supportForm.subject, category: supportForm.category, message: supportForm.message },
    });
    dispatch({
      type: "ADD_TOAST",
      payload: { type: "success", title: "Support request sent", message: "Our team will respond within 24 hours." },
    });
    setSupportSubmitting(false);
    setSupportSuccess(true);
    setTimeout(() => {
      setSupportSuccess(false);
      setSupportForm(EMPTY_FORM);
      setActiveModal(null);
    }, 1800);
  };

  const openModal = (id: typeof activeModal) => {
    setOpenOverlay(null);
    setActiveModal(id);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <header className="relative z-30 flex items-center justify-between border-b border-violet-100 bg-white/80 px-6 py-4 backdrop-blur">
      {/* Left: Logo + nav tabs */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
          R
        </div>
        <span className="font-display text-lg font-semibold text-ink">RARE</span>
        <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-ink/50 md:flex">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.key)}
              className={cn(
                "cursor-pointer border-b-2 pb-4 -mb-4 transition-colors",
                activePage === tab.key
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right: Search + icons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global search */}
        <div className="hidden items-center gap-2 rounded-full border border-violet-100 bg-cream-50 px-4 py-2 text-sm sm:flex">
          <Search size={15} className="shrink-0 text-ink/40" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchValue}
            onChange={e => handleSearch(e.target.value)}
            className="w-32 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:w-48 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* ── Notifications ────────────────────────────────────────────────── */}
        <div className="relative" ref={notifRef}>
          <button
            aria-label="Notifications"
            aria-expanded={openOverlay === "notifications"}
            onClick={() => toggle("notifications")}
            className="relative rounded-full p-2 text-ink/50 transition-colors hover:bg-violet-50 hover:text-ink"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
            )}
          </button>

          {openOverlay === "notifications" && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-[80vh] origin-top-right overflow-hidden rounded-xl border border-violet-100 bg-white shadow-pop animate-modal-in">
              <div className="flex items-center justify-between border-b border-violet-50 px-4 py-3">
                <h3 className="text-sm font-semibold text-ink">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {state.notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Bell size={22} className="mb-2 text-violet-200" />
                    <p className="text-sm text-ink/50">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-violet-50">
                    {state.notifications.map(n => (
                      <div
                        key={n.id}
                        className={cn("px-4 py-3 transition-colors hover:bg-violet-50/40", !n.read && "bg-violet-50/25")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm text-ink", !n.read && "font-semibold")}>{n.title}</p>
                          <span className="shrink-0 text-[10px] text-ink/40">
                            {new Date(n.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-ink/55">{n.message}</p>
                        {!n.read && (
                          <button
                            onClick={() => dispatch({ type: "MARK_NOTIFICATION_READ", payload: n.id })}
                            className="mt-1.5 text-[11px] font-semibold text-violet-600 hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {state.notifications.length > 0 && (
                <div className="border-t border-violet-50 p-2">
                  <button
                    onClick={() => dispatch({ type: "CLEAR_ALL_NOTIFICATIONS" })}
                    className="w-full rounded-lg py-2 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-50"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Settings dropdown ─────────────────────────────────────────────── */}
        <div className="relative" ref={settingsRef}>
          <button
            aria-label="Settings"
            aria-expanded={openOverlay === "settings"}
            onClick={() => toggle("settings")}
            className="rounded-full p-2 text-ink/50 transition-colors hover:bg-violet-50 hover:text-ink"
          >
            <Settings size={18} />
          </button>

          {openOverlay === "settings" && (
            <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-violet-100 bg-white p-1.5 shadow-pop animate-modal-in">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink/35">
                Settings
              </p>
              {[
                { icon: Palette,  label: "Appearance"     },
                { icon: Bell,     label: "Notifications"   },
                { icon: Shield,   label: "Privacy"         },
                { icon: Keyboard, label: "Keyboard Shortcuts" },
                { icon: HelpCircle, label: "About"         },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => {
                    closeOverlay();
                    dispatch({ type: "ADD_TOAST", payload: { type: "info", title: label, message: "Available after backend integration." } });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/65 transition-colors hover:bg-violet-50 hover:text-ink"
                >
                  <Icon size={15} className="shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Profile dropdown ─────────────────────────────────────────────── */}
        <div className="relative border-l border-violet-100 pl-3 sm:pl-4" ref={profileRef}>
          <button
            aria-label="Profile menu"
            aria-expanded={openOverlay === "profile"}
            onClick={() => toggle("profile")}
            className="flex items-center gap-2 text-left"
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold leading-tight text-ink">{settings?.name || "Alex Rivera"}</p>
              <p className="flex items-center gap-0.5 text-xs leading-tight text-ink/40">
                {settings?.role || "Lead Recruiter"} <ChevronDown size={11} className={cn("mt-0.5 transition-transform", openOverlay === "profile" && "rotate-180")} />
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient-soft text-sm font-bold text-white shadow-sm transition-transform hover:scale-105">
              {settings?.name ? settings.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "AR"}
            </div>
          </button>

          {openOverlay === "profile" && (
            <div className="absolute right-0 top-full mt-2 w-52 origin-top-right rounded-xl border border-violet-100 bg-white p-1.5 shadow-pop animate-modal-in">
              {/* Mobile-only header */}
              <div className="mb-1 border-b border-violet-50 px-3 py-2 md:hidden">
                <p className="text-sm font-semibold text-ink">{settings?.name || "Alex Rivera"}</p>
                <p className="text-xs text-ink/50">{settings?.role || "Lead Recruiter"}</p>
              </div>
              <button
                onClick={() => openModal("profile")}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/65 transition-colors hover:bg-violet-50 hover:text-ink"
              >
                <User size={15} className="shrink-0" /> My Profile
              </button>
              <button
                onClick={() => openModal("support")}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/65 transition-colors hover:bg-violet-50 hover:text-ink"
              >
                <LifeBuoy size={15} className="shrink-0" /> Support
              </button>
              <div className="my-1 border-t border-violet-50" />
              <button
                onClick={() => openModal("signout")}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50"
              >
                <LogOut size={15} className="shrink-0" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS — rendered outside the header flex-row to avoid z-index traps
      ══════════════════════════════════════════════════════════════════════ */}

      {/* My Profile */}
      <Modal isOpen={activeModal === "profile"} onClose={() => setActiveModal(null)} title="My Profile">
        <div className="space-y-4">
          <div className="flex items-center gap-4 border-b border-violet-50 pb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-lg font-bold text-white shadow-sm">
              {profileName ? profileName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "AR"}
            </div>
            <div>
              <h3 className="font-semibold text-ink">{profileName || "Recruiter"}</h3>
              <p className="text-sm text-ink/50">{profileRole || ""}</p>
              <p className="text-[11px] text-ink/40 mt-0.5">{profileEmail || ""}</p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">Full Name</label>
            <input 
              value={profileName} 
              onChange={e => setProfileName(e.target.value)}
              className="w-full rounded-lg border border-violet-100 bg-cream-50/50 px-3 py-2 text-sm text-ink/70 focus:border-violet-400 focus:outline-none" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">Work Email</label>
            <input 
              value={profileEmail} 
              onChange={e => setProfileEmail(e.target.value)}
              className="w-full rounded-lg border border-violet-100 bg-cream-50/50 px-3 py-2 text-sm text-ink/70 focus:border-violet-400 focus:outline-none" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">Role / Designation</label>
            <input 
              value={profileRole} 
              onChange={e => setProfileRole(e.target.value)}
              className="w-full rounded-lg border border-violet-100 bg-cream-50/50 px-3 py-2 text-sm text-ink/70 focus:border-violet-400 focus:outline-none" 
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => setActiveModal(null)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-ink/65 hover:bg-violet-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Support Center */}
      <Modal
        isOpen={activeModal === "support"}
        onClose={() => { setActiveModal(null); setSupportForm(EMPTY_FORM); setSupportErrors({}); setSupportSuccess(false); }}
        title="Support Center"
        className="max-w-lg"
      >
        {supportSuccess ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
              <MessageSquare size={26} />
            </div>
            <h3 className="text-base font-semibold text-ink">Request submitted!</h3>
            <p className="mt-1 text-sm text-ink/60">Our team will respond within 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Quick links */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { icon: BookOpen, label: "Documentation" },
                { icon: HelpCircle, label: "FAQ" },
                { icon: Bug, label: "Report Bug" },
                { icon: Lightbulb, label: "Feature Request" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => {
                    setSupportForm(f => ({ ...f, category: label }));
                    dispatch({ type: "ADD_TOAST", payload: { type: "info", title: label, message: "Fill in the form below." } });
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-violet-100 bg-cream-50 p-3 text-ink/55 transition-colors hover:border-violet-300 hover:text-ink"
                >
                  <Icon size={18} />
                  <span className="text-[11px] font-semibold">{label}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-violet-50 pt-4">
              <p className="mb-3 text-sm font-semibold text-ink">Contact Support</p>
              {/* Subject */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-ink/60">Subject *</label>
                <input
                  type="text"
                  value={supportForm.subject}
                  onChange={e => { setSupportForm(f => ({ ...f, subject: e.target.value })); setSupportErrors(e => ({ ...e, subject: undefined })); }}
                  placeholder="Brief description of your issue"
                  className={cn(
                    "w-full rounded-xl border bg-cream-50 px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-violet-400/30 transition-colors",
                    supportErrors.subject ? "border-rose-300 focus:border-rose-400" : "border-violet-100 focus:border-violet-400",
                  )}
                />
                {supportErrors.subject && (
                  <p className="mt-1 text-xs text-rose-500">{supportErrors.subject}</p>
                )}
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-ink/60">Category</label>
                <select
                  value={supportForm.category}
                  onChange={e => setSupportForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-xl border border-violet-100 bg-cream-50 px-3 py-2.5 text-sm text-ink focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                >
                  {["General Question", "Report Bug", "Feature Request", "Documentation", "FAQ", "Account Issue"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-semibold text-ink/60">Message *</label>
                <textarea
                  rows={4}
                  value={supportForm.message}
                  onChange={e => { setSupportForm(f => ({ ...f, message: e.target.value })); setSupportErrors(e => ({ ...e, message: undefined })); }}
                  placeholder="Describe your issue in detail..."
                  className={cn(
                    "w-full resize-none rounded-xl border bg-cream-50 px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-violet-400/30 transition-colors",
                    supportErrors.message ? "border-rose-300 focus:border-rose-400" : "border-violet-100 focus:border-violet-400",
                  )}
                />
                {supportErrors.message && (
                  <p className="mt-1 text-xs text-rose-500">{supportErrors.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setActiveModal(null); setSupportForm(EMPTY_FORM); setSupportErrors({}); }}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-ink/65 transition-colors hover:bg-violet-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSupportSubmit}
                  disabled={supportSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-600 disabled:opacity-60"
                >
                  {supportSubmitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12" />
                      </svg>
                      Sending…
                    </>
                  ) : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Sign Out confirmation */}
      <Modal isOpen={activeModal === "signout"} onClose={() => setActiveModal(null)} title="Sign Out">
        <div className="space-y-4">
          <p className="text-sm text-ink/70">
            Are you sure you want to sign out? This will reset the demo session — uploaded resumes, current analysis,
            rankings, and analytics will be cleared.
          </p>
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            Templates and History will be preserved.
          </p>
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => setActiveModal(null)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-ink/65 transition-colors hover:bg-violet-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
