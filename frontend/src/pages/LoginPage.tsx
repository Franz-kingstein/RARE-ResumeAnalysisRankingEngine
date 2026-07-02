import { useState, useCallback, useEffect, useRef } from "react";
import { Eye, EyeOff, Loader2, LogIn, CheckCircle, Brain, BarChart3, Users, LayoutGrid } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getRememberedEmail } from "../services/authService";
import { cn } from "../utils/cn";

// ─── Brand features list ──────────────────────────────────────────────────────

const FEATURES = [
  { icon: Brain,      label: "AI-powered Resume Analysis" },
  { icon: BarChart3,  label: "Candidate Ranking Engine" },
  { icon: Users,      label: "Skill Intelligence Mapping" },
  { icon: LayoutGrid, label: "Recruitment Dashboard" },
];

// ─── Form validation ──────────────────────────────────────────────────────────

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Work email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Enter a valid email address.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  // Pre-fill remembered email
  useEffect(() => {
    const remembered = getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
    emailRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    setServerError(null);

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    const result = await login({ email: email.trim(), password, rememberMe });

    if (result.error) {
      setServerError(result.error);
    } else {
      setSuccess(true);
    }
  }, [email, password, rememberMe, login]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleSubmit();
  };

  return (
    <div className="min-h-screen flex bg-cream-50">
      {/* ── Left brand panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between relative overflow-hidden bg-brand-gradient p-12">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold text-white backdrop-blur-sm border border-white/20">
              R
            </div>
            <div>
              <p className="text-white font-display text-xl font-bold leading-tight">RARE</p>
              <p className="text-white/60 text-xs leading-tight">ResumeAnalysisRankingEngine</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-3">
            Resume Analysis &<br />Ranking Platform
          </h1>
          <p className="text-white/65 text-base mb-10 leading-relaxed max-w-sm">
            Enterprise-grade AI recruitment intelligence for HR teams and technical hiring managers.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                  <Icon size={17} className="text-white/85" />
                </div>
                <span className="text-white/80 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/70 text-xs font-medium">Demo Mode Active</span>
          </div>
        </div>
      </div>

      {/* ── Right auth panel ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-base font-bold text-white">
            R
          </div>
          <span className="font-display text-xl font-bold text-ink">RARE</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="rounded-xl2 border border-violet-100 bg-white p-8 shadow-panel animate-modal-in">
            <div className="mb-7">
              <h2 className="font-display text-2xl font-bold text-ink leading-tight">Welcome back</h2>
              <p className="mt-1 text-sm text-ink/50">Sign in to your HR Recruiter account</p>
            </div>

            {/* Success state */}
            {success ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
                  <CheckCircle size={28} className="text-violet-600" />
                </div>
                <p className="font-semibold text-ink">Signing you in…</p>
                <p className="mt-1 text-sm text-ink/50">Loading your workspace</p>
              </div>
            ) : (
              <div className="space-y-4" onKeyDown={handleKeyDown}>
                {/* Server error */}
                {serverError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 animate-modal-in">
                    {serverError}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-ink/65" htmlFor="login-email">
                    Work Email
                  </label>
                  <input
                    id="login-email"
                    ref={emailRef}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(null); setServerError(null); }}
                    disabled={loading}
                    placeholder="you@company.com"
                    className={cn(
                      "w-full rounded-xl border bg-cream-50/60 px-4 py-3 text-sm text-ink placeholder:text-ink/30",
                      "focus:outline-none focus:ring-2 focus:ring-violet-400/30 transition-all",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      emailError ? "border-rose-300 focus:border-rose-400" : "border-violet-100 focus:border-violet-400",
                    )}
                  />
                  {emailError && <p className="mt-1 text-xs text-rose-500">{emailError}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-semibold text-ink/65" htmlFor="login-password">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="text-xs font-semibold text-violet-500 hover:text-violet-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setPasswordError(null); setServerError(null); }}
                      disabled={loading}
                      placeholder="Enter your password"
                      className={cn(
                        "w-full rounded-xl border bg-cream-50/60 px-4 py-3 pr-11 text-sm text-ink placeholder:text-ink/30",
                        "focus:outline-none focus:ring-2 focus:ring-violet-400/30 transition-all",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        passwordError ? "border-rose-300 focus:border-rose-400" : "border-violet-100 focus:border-violet-400",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink/70 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError && <p className="mt-1 text-xs text-rose-500">{passwordError}</p>}
                </div>

                {/* Remember me */}
                <label className="flex cursor-pointer items-center gap-2.5 select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={cn(
                      "h-4.5 w-4.5 h-[18px] w-[18px] rounded border-2 transition-all flex items-center justify-center",
                      rememberMe ? "bg-violet-500 border-violet-500" : "border-violet-200 bg-white",
                    )}>
                      {rememberMe && (
                        <svg viewBox="0 0 12 10" className="h-2.5 w-2.5 text-white fill-none stroke-current stroke-2">
                          <polyline points="1.5,5 4.5,8 10.5,2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-ink/65">Remember me</span>
                </label>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient-soft py-3 text-sm font-semibold text-white shadow-pop transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      Sign In
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Access notice */}
          <p className="mt-5 text-center text-xs text-ink/40 leading-relaxed px-2">
            Only authorized HR Recruiters and Administrators can access this system.
          </p>

          {/* Demo hint */}
          <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3">
            <p className="text-xs font-semibold text-violet-700 mb-1">Demo Accounts</p>
            <p className="text-xs text-violet-600/80 font-mono">admin@rare.ai / Admin@123</p>
            <p className="text-xs text-violet-600/80 font-mono">hr@rare.ai / Hr@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
