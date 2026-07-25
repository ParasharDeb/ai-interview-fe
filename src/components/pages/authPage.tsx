import { useState } from "react";
import { ArrowLeft, Moon, Sun, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useTheme } from "../../lib/theme-context";
import { BACKEND_URL } from "../../lib/config";

type AuthMode = "signin" | "signup";

const FEATURES = [
  "Every question comes from your own repos",
  "Follow-ups that adapt to how you answer",
  "Full transcript, scored the moment you're done",
];

export const AuthPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.email || !form.password || (mode === "signup" && !form.username)) {
      toast.error("Please fill in the required fields.");
      return;
    }

    if (mode === "signup") {
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);

    if (form.password.length < 5 || !hasSpecialCharacter) {
      toast.error(
        "Password must be at least 5 characters long and contain at least one special character."
      );
      return;
    }
  }

  setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/signup" : "/signin";
      const payload =
        mode === "signup"
          ? { username: form.username, email: form.email, password: form.password }
          : { email: form.email, password: form.password };

      const response = await axios.post(`${BACKEND_URL}${endpoint}`, payload);

      if (mode === "signup") {
        toast.success("Account created. You can sign in now.");
        setMode("signin");
        setForm((prev) => ({ ...prev, username: "" }));
      } else {
        const token = response.data?.token;
        if (!token) {
          throw new Error("No token received from server.");
        }

        localStorage.setItem("authToken", token);
        toast.success("Signed in successfully.");
        navigate("/information");
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Authentication failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  const bg = isDark ? "#0a0a0c" : "#eceeef";
  const brandBg = isDark ? "#0b0b0d" : "#f4f4f5";
  const panelAlt = isDark ? "#18181b" : "#ffffff";
  const border = isDark ? "#28282d" : "#dcdce0";
  const textPrimary = isDark ? "#f4f4f5" : "#18181b";
  const textMuted = isDark ? "#8b8b93" : "#71717a";
  const inverse = isDark ? "#18181b" : "#f4f4f5";
  const solid = isDark ? "#f4f4f5" : "#18181b";
  const accent = isDark ? "#fcfcfc" : "#d8d8d8";
  const accentSoft = isDark ? "rgba(242,177,52,0.16)" : "rgba(185,121,15,0.12)";

  return (
    <div
      style={{ background: bg, color: textPrimary }}
      className="min-h-screen grid lg:grid-cols-2 transition-colors duration-500"
    >
      <style>{`
        .icon-btn { transition: opacity 0.15s ease; }
        .icon-btn:hover { opacity: 0.7; }
        .field-line {
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .field-input:focus ~ .field-line { transform: scaleX(1); }
        .submit-btn { transition: opacity 0.15s ease, transform 0.1s ease; }
        .submit-btn:hover:not(:disabled) { opacity: 0.88; }
        .submit-btn:active:not(:disabled) { transform: scale(0.99); }
      `}</style>

      {/* ============ Branding panel (desktop only) ============ */}
      <div
        className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: brandBg, borderRight: `1px solid ${border}` }}
      >
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl"
          style={{ background: accentSoft }}
        />

        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center gap-2.5"
        >
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center font-mono text-sm font-bold"
            style={{ background: accent, color: "#18181b" }}
          >
            &gt;_
          </div>
          <span className="font-mono font-semibold text-lg">InterviewAI</span>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
          className="relative max-w-md"
        >
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight leading-[1.15] mb-4"
          >
            Your next interview starts with your last commit.
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
            className="text-sm mb-8 leading-relaxed"
            style={{ color: textMuted }}
          >
            Connect GitHub and this interviewer asks about the code you actually
            wrote — not a question bank.
          </motion.p>

          <ul className="space-y-3 mb-10">
            {FEATURES.map((feature) => (
              <motion.li
                key={feature}
                variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-2.5 text-sm"
              >
                <span
                  className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: accentSoft }}
                >
                  <Check size={10} style={{ color: accent }} strokeWidth={3} />
                </span>
                <span style={{ color: textPrimary }}>{feature}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
            className="rounded-xl p-4 font-mono text-xs"
            style={{ background: panelAlt, border: `1px solid ${border}` }}
          >
            <div style={{ color: textMuted }}>$ github.com/you/your-repo</div>
            <div className="mt-1.5 leading-relaxed" style={{ color: textPrimary }}>
              Interviewer: walk me through the tradeoff in{" "}
              <span style={{ color: accent }}>auth.ts</span>, line 42.
            </div>
          </motion.div>
        </motion.div>

        <span className="relative text-xs" style={{ color: textMuted }}>
          &copy; 2025 InterviewAI
        </span>
      </div>

      {/* ============ Form panel ============ */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-6 sm:px-8">
          <button
            onClick={() => navigate("/")}
            aria-label="Go back home"
            className="icon-btn flex items-center justify-center"
            style={{ color: textMuted }}
          >
            <ArrowLeft size={18} />
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="icon-btn flex items-center justify-center"
            style={{ color: textMuted }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <main className="flex-1 flex items-center justify-center px-6 py-10 sm:py-16">
          <div className="w-full max-w-[360px]">
            {/* mobile-only brand mark */}
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs font-bold"
                style={{ background: accent, color: "#18181b" }}
              >
                &gt;_
              </div>
              <span className="font-mono font-semibold">InterviewAI</span>
            </div>

            {/* segmented mode switch */}
            <div
              className="relative inline-flex rounded-full p-1 mb-8"
              style={{ background: panelAlt, border: `1px solid ${border}` }}
            >
              {(["signin", "signup"] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="relative px-4 py-1.5 text-xs font-medium rounded-full"
                  style={{ color: mode === m ? inverse : textMuted }}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="authTabBg"
                      className="absolute inset-0 rounded-full"
                      style={{ background: solid }}
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    />
                  )}
                  <span className="relative">{m === "signin" ? "Sign in" : "Create account"}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-3xl font-semibold tracking-tight">
                  {mode === "signin" ? "Sign in" : "Create an account"}
                </h1>
                <p className="mt-2 text-sm" style={{ color: textMuted }}>
                  {mode === "signin"
                    ? "Pick up where you left off."
                    : "Set up your account to start practicing."}
                </p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="mt-10 space-y-7">
              <AnimatePresence initial={false}>
                {mode === "signup" && (
                  <motion.div
                    key="username"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <label className="block text-[11px] uppercase tracking-wider mb-2" style={{ color: textMuted }}>
                        Username
                      </label>
                      <input
                        type="text"
                        value={form.username}
                        onChange={(event) => handleChange("username", event.target.value)}
                        className="field-input w-full bg-transparent pb-2 text-sm outline-none"
                        style={{ color: textPrimary, borderBottom: `1px solid ${border}` }}
                        autoComplete="username"
                      />
                      <span
                        className="field-line absolute left-0 bottom-0 h-px w-full"
                        style={{ background: accent }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <label className="block text-[11px] uppercase tracking-wider mb-2" style={{ color: textMuted }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="field-input w-full bg-transparent pb-2 text-sm outline-none"
                  style={{ color: textPrimary, borderBottom: `1px solid ${border}` }}
                  autoComplete="email"
                />
                <span className="field-line absolute left-0 bottom-0 h-px w-full" style={{ background: accent }} />
              </div>

              <div className="relative">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider" style={{ color: textMuted }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex items-center gap-1 text-[11px] transition-colors"
                    style={{ color: textMuted }}
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  className="field-input w-full bg-transparent pb-2 text-sm outline-none"
                  style={{ color: textPrimary, borderBottom: `1px solid ${border}` }}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                <span className="field-line absolute left-0 bottom-0 h-px w-full" style={{ background: accent }} />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.99 }}
                className="submit-btn w-full rounded-lg py-3 text-sm font-medium disabled:opacity-50"
                style={{ background: solid, color: inverse }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait
                  </span>
                ) : mode === "signin" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </motion.button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};