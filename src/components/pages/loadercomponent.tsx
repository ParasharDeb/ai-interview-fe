import { useTheme } from "../../lib/theme-context";

const steps = [
  { label: "Fetching repositories", delay: "0s" },
  { label: "Analyzing code quality", delay: "0.3s" },
  { label: "Generating questions", delay: "0.6s" },
];

export function Loader() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const bg = isDark ? "#0a0a0c" : "#eceeef";
  const panelAlt = isDark ? "#18181b" : "#f4f4f5";
  const border = isDark ? "#28282d" : "#dcdce0";
  const textPrimary = isDark ? "#f4f4f5" : "#18181b";
  const textMuted = isDark ? "#8b8b93" : "#71717a";

  return (
    <div
      style={{ background: bg, color: textPrimary }}
      className="flex items-center justify-center min-h-screen transition-colors duration-500"
    >
      <style>{`
        @keyframes blobMorph {
          0%   { border-radius: 42% 58% 65% 35% / 45% 45% 55% 55%; }
          25%  { border-radius: 60% 40% 30% 70% / 50% 62% 38% 50%; }
          50%  { border-radius: 35% 65% 55% 45% / 62% 40% 60% 38%; }
          75%  { border-radius: 58% 42% 40% 60% / 40% 55% 45% 60%; }
          100% { border-radius: 42% 58% 65% 35% / 45% 45% 55% 55%; }
        }
        @keyframes blobPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.045); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .loader-blob {
          animation: blobMorph 4.5s ease-in-out infinite, blobPulse 1.1s ease-in-out infinite;
        }
        .loader-glow {
          animation: glowPulse 1.4s ease-in-out infinite;
        }
        .loader-dot {
          animation: dotBounce 1.2s infinite;
        }
        .loader-step {
          opacity: 0;
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>

      <div className="flex flex-col items-center gap-8">
        {/* Blob loader, matching the interview stage */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div
            className="loader-glow absolute rounded-full blur-2xl"
            style={{
              width: 150,
              height: 150,
              background: isDark
                ? "radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)"
                : "radial-gradient(circle, rgba(24,24,27,0.25), transparent 70%)",
            }}
          />
          <div
            className="loader-blob relative"
            style={{
              width: 96,
              height: 96,
              background: isDark
                ? "linear-gradient(145deg, #f4f4f5, #52525b 55%, #18181b)"
                : "linear-gradient(145deg, #3f3f46, #a1a1aa 55%, #e4e4e7)",
              boxShadow: isDark
                ? "0 0 40px rgba(255,255,255,0.12), inset 0 0 20px rgba(0,0,0,0.4)"
                : "0 0 30px rgba(0,0,0,0.15), inset 0 0 20px rgba(255,255,255,0.3)",
            }}
          />
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Analyzing your GitHub</h2>
          <p className="text-sm" style={{ color: textMuted }}>
            Building your personalized interview
            <span className="inline-flex gap-1 ml-1">
              <span className="loader-dot inline-block" style={{ animationDelay: "0s" }}>.</span>
              <span className="loader-dot inline-block" style={{ animationDelay: "0.2s" }}>.</span>
              <span className="loader-dot inline-block" style={{ animationDelay: "0.4s" }}>.</span>
            </span>
          </p>
        </div>

        {/* Progress steps */}
        <div className="space-y-3 w-full max-w-xs">
          {steps.map((item, i) => (
            <div
              key={i}
              className="loader-step flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{
                background: panelAlt,
                border: `1px solid ${border}`,
                animationDelay: item.delay,
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ background: textMuted }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: textMuted }}
                />
              </span>
              <span className="text-sm" style={{ color: textMuted }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom hint */}
        <p className="text-xs text-center" style={{ color: textMuted }}>
          This may take a few moments. We're preparing something great! ✨
        </p>
      </div>
    </div>
  );
}