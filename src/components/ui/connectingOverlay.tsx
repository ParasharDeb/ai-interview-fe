import { useEffect, useState } from "react";
import { useTheme } from "../../lib/theme-context";

type ConnectingOverlayProps = {
  /** Controls visibility. Pass `true` while the socket is connecting, `false` once ready. */
  open: boolean;
  /** Roughly how long the connection is expected to take, for the progress bar animation. */
  durationMs?: number;
};

const tips = [
  { title: "Introduce yourself to the ai", body: "tell the interviewer about yourself in 2 sentences to start the interview" },
];

const stages = [
  "Connecting to your AI interviewer",
  "Warming up the model",
  "Loading your profile",
  "Almost ready",
];

export function ConnectingOverlay({ open, durationMs = 8000 }: ConnectingOverlayProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [tipIndex, setTipIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const bg = isDark ? "#0a0a0c" : "#eceeef";
  const panel = isDark ? "#131316" : "#ffffff";
  const panelAlt = isDark ? "#18181b" : "#f4f4f5";
  const border = isDark ? "#28282d" : "#dcdce0";
  const textPrimary = isDark ? "#f4f4f5" : "#18181b";
  const textMuted = isDark ? "#8b8b93" : "#71717a";

  // Rotate tips every ~2.2s while open
  useEffect(() => {
    if (!open) return;
    setTipIndex(0);
    const interval = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 2200);
    return () => window.clearInterval(interval);
  }, [open]);

  // Rotate stage labels across the expected duration
  useEffect(() => {
    if (!open) return;
    setStageIndex(0);
    const stepTime = durationMs / stages.length;
    const interval = window.setInterval(() => {
      setStageIndex((prev) => Math.min(prev + 1, stages.length - 1));
    }, stepTime);
    return () => window.clearInterval(interval);
  }, [open, durationMs]);

  // Progress bar fill, eases toward ~92% and holds (never claims false completion)
  useEffect(() => {
    if (!open) {
      setProgress(0);
      return;
    }
    const start = Date.now();
    const frame = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(92, (elapsed / durationMs) * 100);
      setProgress(pct);
    }, 100);
    return () => window.clearInterval(frame);
  }, [open, durationMs]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: isDark ? "rgba(10,10,12,0.72)" : "rgba(236,238,239,0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes blobMorph {
          0%   { border-radius: 42% 58% 65% 35% / 45% 45% 55% 55%; }
          25%  { border-radius: 60% 40% 30% 70% / 50% 62% 38% 50%; }
          50%  { border-radius: 35% 65% 55% 45% / 62% 40% 60% 38%; }
          75%  { border-radius: 58% 42% 40% 60% / 40% 55% 45% 60%; }
          100% { border-radius: 42% 58% 65% 35% / 45% 45% 55% 55%; }
        }
        @keyframes blobPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.1); }
        }
        @keyframes tipIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .overlay-card { animation: overlayIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        .overlay-blob { animation: blobMorph 3.5s ease-in-out infinite, blobPulse 1.3s ease-in-out infinite; }
        .overlay-glow { animation: glowPulse 1.6s ease-in-out infinite; }
        .overlay-tip { animation: tipIn 0.35s ease-out; }
      `}</style>

      <div
        className="overlay-card relative w-full max-w-md rounded-[2rem] p-8 sm:p-10 text-center"
        style={{ background: panel, border: `1px solid ${border}` }}
      >
        {/* Blob */}
        <div className="relative mx-auto mb-6 h-24 w-24 flex items-center justify-center">
          <div
            className="overlay-glow absolute rounded-full blur-2xl"
            style={{
              width: 130,
              height: 130,
              background: isDark
                ? "radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)"
                : "radial-gradient(circle, rgba(24,24,27,0.25), transparent 70%)",
            }}
          />
          <div
            className="overlay-blob relative"
            style={{
              width: 76,
              height: 76,
              background: isDark
                ? "linear-gradient(145deg, #f4f4f5, #52525b 55%, #18181b)"
                : "linear-gradient(145deg, #3f3f46, #a1a1aa 55%, #e4e4e7)",
              boxShadow: isDark
                ? "0 0 40px rgba(255,255,255,0.12), inset 0 0 20px rgba(0,0,0,0.4)"
                : "0 0 30px rgba(0,0,0,0.15), inset 0 0 20px rgba(255,255,255,0.3)",
            }}
          />
        </div>

        {/* Stage label */}
        <p className="text-xs font-medium uppercase tracking-[0.15em]" style={{ color: textMuted }}>
          Setting up
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight" style={{ color: textPrimary }}>
          {stages[stageIndex]}…
        </h2>

        {/* Progress bar */}
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full" style={{ background: panelAlt }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: textPrimary,
              transition: "width 0.2s linear",
            }}
          />
        </div>

        {/* Rotating tip */}
        <div
          key={tipIndex}
          className="overlay-tip mt-8 rounded-2xl p-5 text-left"
          style={{ background: panelAlt, border: `1px solid ${border}` }}
        >
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: textMuted }}>
            Tip
          </p>
          <p className="mt-1.5 text-sm font-semibold" style={{ color: textPrimary }}>
            {tips[tipIndex]?.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: textMuted }}>
            {tips[tipIndex]?.body}
          </p>
        </div>

        {/* Dots indicating tip position */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {tips.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === tipIndex ? 16 : 6,
                background: i === tipIndex ? textPrimary : border,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}