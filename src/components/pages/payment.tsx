import { useState } from "react";
import { ArrowLeft, Moon, Sun, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../lib/theme-context";

type PlanId = "starter" | "pro" | "max";

type Plan = {
  id: PlanId;
  interviews: number;
  price: number;
  perInterview: string;
  tag?: string;
};

const plans: Plan[] = [
  { id: "starter", interviews: 3, price: 69, perInterview: "₹23.00 / interview" },
  { id: "pro", interviews: 10, price: 149, perInterview: "₹14.90 / interview", tag: "Most popular" },
  { id: "max", interviews: 20, price: 199, perInterview: "₹9.95 / interview", tag: "Best value" },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selected, setSelected] = useState<PlanId>("pro");
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";

  const bg = isDark ? "#0a0a0c" : "#eceeef";
  const panel = isDark ? "#131316" : "#ffffff";
  const panelAlt = isDark ? "#18181b" : "#f4f4f5";
  const border = isDark ? "#28282d" : "#dcdce0";
  const borderStrong = isDark ? "#3f3f46" : "#b8b8bf";
  const textPrimary = isDark ? "#f4f4f5" : "#18181b";
  const textMuted = isDark ? "#8b8b93" : "#71717a";
  const inverse = isDark ? "#18181b" : "#f4f4f5";
  const solid = isDark ? "#f4f4f5" : "#18181b";

  const activePlan = plans.find((p) => p.id === selected)!;

  // Payment handling is left for you to wire up (Stripe, etc.)
  async function handleCheckout() {
    setLoading(true);
    try {
      // TODO: call your backend / payment provider here with `activePlan`
      await new Promise((resolve) => setTimeout(resolve, 900));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ background: bg, color: textPrimary }}
      className="min-h-screen transition-colors duration-500"
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        .icon-btn { transition: opacity 0.15s ease; }
        .icon-btn:hover { opacity: 0.7; }
        .plan-card {
          transition: border-color 0.2s ease, transform 0.15s ease, background-color 0.2s ease;
          cursor: pointer;
        }
        .plan-card:hover { transform: translateY(-2px); }
        .submit-btn { transition: opacity 0.15s ease, transform 0.1s ease; }
        .submit-btn:hover:not(:disabled) { opacity: 0.88; }
        .submit-btn:active:not(:disabled) { transform: scale(0.99); }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-6 sm:px-8">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
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

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-8 sm:px-8">
        {/* Heading */}
        <div className="fade-in mb-14 max-w-lg" style={{ animationDelay: "0.02s" }}>
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: textPrimary }} />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: textMuted }}>
              Interview credits
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Choose how much you want to practice
          </h1>
          <p className="mt-3 text-sm" style={{ color: textMuted }}>
            Buy a pack of AI mock interviews. Credits never expire and can be used for any role.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.map((plan, i) => {
            const isSelected = plan.id === selected;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className="plan-card fade-in relative flex flex-col items-start rounded-2xl p-6 text-left"
                style={{
                  animationDelay: `${0.06 + i * 0.06}s`,
                  background: isSelected ? panelAlt : panel,
                  border: `1px solid ${isSelected ? borderStrong : border}`,
                }}
              >
                {plan.tag && (
                  <span
                    className="absolute -top-3 left-6 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider"
                    style={{ background: solid, color: inverse }}
                  >
                    {plan.tag}
                  </span>
                )}

                <div
                  className="mb-5 flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    border: `1px solid ${isSelected ? textPrimary : border}`,
                    background: isSelected ? textPrimary : "transparent",
                  }}
                >
                  {isSelected && <Check size={14} style={{ color: inverse }} />}
                </div>

                <div className="text-sm font-medium" style={{ color: textMuted }}>
                  {plan.interviews} interviews
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight">₹{plan.price}</span>
                </div>
                <div className="mt-2 text-xs" style={{ color: textMuted }}>
                  {plan.perInterview}
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary / checkout */}
        <div
          className="fade-in mt-10 flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: panel, border: `1px solid ${border}`, animationDelay: "0.26s" }}
        >
          <div>
            <div className="text-sm" style={{ color: textMuted }}>
              You're getting
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight">
              {activePlan.interviews} interviews — ${activePlan.price}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="submit-btn w-full rounded-lg px-6 py-3 text-sm font-medium disabled:opacity-50 sm:w-auto"
            style={{ background: solid, color: inverse }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              "Continue to payment"
            )}
          </button>
        </div>

        <p className="fade-in mt-6 text-center text-xs" style={{ color: textMuted, animationDelay: "0.32s" }}>
          Secure checkout. Cancel anytime before your first interview.
        </p>
      </main>
    </div>
  );
}