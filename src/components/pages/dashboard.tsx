import { useMemo, useState, type ReactNode } from "react";
import {
  Zap,
  Clock,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Activity,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePalette } from "../../lib/palette";
import { useUserData } from "../../lib/useUserData";
import { ScoreChart, type ScorePoint } from "../ui/scoreChart";
import { PageHeader, PageLoading } from "../ui/pageHeader";
import { ScoreBadge } from "../ui/scoreBadge";

type Range = "all" | "90d" | "30d";

const RANGES: { id: Range; label: string; days?: number }[] = [
  { id: "30d", label: "30D", days: 30 },
  { id: "90d", label: "90D", days: 90 },
  { id: "all", label: "All" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const p = usePalette();
  const { tokens, interviews, scored, loading } = useUserData({ withTokens: true });

  const [range, setRange] = useState<Range>("all");
  const [now] = useState(() => Date.now());

  const points = useMemo<ScorePoint[]>(
    () => scored.map((i) => ({ id: i.id, date: i.createdAt, score: i.score, label: i.role || "General" })),
    [scored],
  );

  const chartPoints = useMemo(() => {
    const days = RANGES.find((r) => r.id === range)?.days;
    if (!days) return points;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return points.filter((pt) => new Date(pt.date).getTime() >= cutoff);
  }, [points, range, now]);

  const average = points.length ? Math.round(points.reduce((sum, pt) => sum + pt.score, 0) / points.length) : null;
  const best = points.length ? points.reduce((top, pt) => (pt.score > top.score ? pt : top)) : null;
  const latest = points.length ? points[points.length - 1] : null;
  const previous = points.length > 1 ? points[points.length - 2] : null;
  const latestDelta = latest && previous ? latest.score - previous.score : null;

  const usedPct =
    tokens && tokens.totalTokens > 0 ? Math.min(100, Math.round((tokens.usedTokens / tokens.totalTokens) * 100)) : 0;

  const openInterview = (id: string) => navigate(`/interviews?id=${id}`);

  const tiles: { icon: ReactNode; label: string; value: number | null; sub: ReactNode }[] = [
    {
      icon: <Target size={15} />,
      label: "Average score",
      value: average,
      sub: `across ${points.length} scored interview${points.length === 1 ? "" : "s"}`,
    },
    {
      icon: <Trophy size={15} />,
      label: "Best score",
      value: best?.score ?? null,
      sub: best ? `${best.label} · ${new Date(best.date).toLocaleDateString()}` : "No scores yet",
    },
    {
      icon: <Activity size={15} />,
      label: "Latest score",
      value: latest?.score ?? null,
      sub:
        latestDelta === null ? (
          latest ? "Your first scored interview" : "No scores yet"
        ) : (
          <span className="flex items-center gap-1">
            {latestDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {latestDelta > 0 ? "+" : ""}
            {latestDelta} vs previous
          </span>
        ),
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Your progress"
        subtitle="How your interview scores are trending, at a glance."
      />

      {loading ? (
        <PageLoading label="Loading your data..." />
      ) : (
        <>
          {/* Stat tiles */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {tiles.map((tile, index) => (
              <div
                key={tile.label}
                className="fade-in rounded-2xl p-5"
                style={{ background: p.panel, border: `1px solid ${p.border}`, animationDelay: `${0.04 + index * 0.03}s` }}
              >
                <div className="mb-3 flex items-center gap-2 text-xs font-medium" style={{ color: p.textMuted }}>
                  {tile.icon}
                  {tile.label}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight tabular-nums">{tile.value ?? "—"}</span>
                  {tile.value !== null && (
                    <span className="text-sm" style={{ color: p.textMuted }}>
                      /100
                    </span>
                  )}
                </div>
                <div className="mt-1.5 truncate text-xs" style={{ color: p.textMuted }}>
                  {tile.sub}
                </div>
              </div>
            ))}

            <div
              className="fade-in rounded-2xl p-5"
              style={{ background: p.panel, border: `1px solid ${p.border}`, animationDelay: "0.13s" }}
            >
              <div className="mb-3 flex items-center gap-2 text-xs font-medium" style={{ color: p.textMuted }}>
                <Zap size={15} />
                Tokens left
              </div>
              {tokens ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold tracking-tight tabular-nums">
                      {tokens.remainingTokens.toLocaleString()}
                    </span>
                    <span className="text-sm" style={{ color: p.textMuted }}>
                      /{tokens.totalTokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: p.panelAlt }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${usedPct}%`, background: p.textPrimary }}
                    />
                  </div>
                  <div className="mt-1.5 text-xs" style={{ color: p.textMuted }}>
                    {usedPct}% used
                  </div>
                </>
              ) : (
                <p className="text-sm" style={{ color: p.textMuted }}>
                  No token data.
                </p>
              )}
            </div>
          </div>

          {/* Score trend */}
          <div
            className="fade-in mb-6 rounded-2xl p-6"
            style={{ background: p.panel, border: `1px solid ${p.border}`, animationDelay: "0.16s" }}
          >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} style={{ color: p.textMuted }} />
                  <span className="text-sm font-medium">Score trend</span>
                </div>
                <p className="mt-1 text-xs" style={{ color: p.textMuted }}>
                  Every scored interview by date. Click a point to open its transcript.
                </p>
              </div>

              <div className="flex rounded-lg p-0.5" style={{ background: p.panelAlt }}>
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRange(r.id)}
                    className="range-btn rounded-md px-3 py-1 text-xs font-medium"
                    style={{
                      background: range === r.id ? p.panel : "transparent",
                      color: range === r.id ? p.textPrimary : p.textMuted,
                      boxShadow: range === r.id ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {chartPoints.length > 0 ? (
              <ScoreChart points={chartPoints} isDark={p.isDark} onSelect={openInterview} />
            ) : (
              <div
                className="flex h-[260px] flex-col items-center justify-center gap-2 rounded-xl text-center"
                style={{ background: p.panelAlt, color: p.textMuted }}
              >
                <Activity size={20} />
                <p className="text-sm">
                  {points.length === 0
                    ? "Finish an interview to see your score trend here."
                    : "No scored interviews in this range."}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Recent interviews */}
            <div
              className="fade-in overflow-hidden rounded-2xl lg:col-span-3"
              style={{ background: p.panel, border: `1px solid ${p.border}`, animationDelay: "0.2s" }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: `1px solid ${p.border}` }}
              >
                <span className="text-sm font-medium">Recent interviews</span>
                <Link to="/interviews" className="icon-btn flex items-center gap-1 text-xs" style={{ color: p.textMuted }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {interviews.length === 0 && (
                <p className="px-5 py-6 text-sm" style={{ color: p.textMuted }}>
                  No interviews yet.
                </p>
              )}

              {interviews.slice(0, 5).map((interview, index, list) => (
                <button
                  key={interview.id}
                  onClick={() => openInterview(interview.id)}
                  className="row-btn flex w-full items-center justify-between px-5 py-3.5 text-left"
                  style={{ borderBottom: index === list.length - 1 ? "none" : `1px solid ${p.border}` }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{interview.role || "General"}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: p.textMuted }}>
                      <Clock size={11} />
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <ScoreBadge interview={interview} />
                    <ChevronRight size={16} style={{ color: p.textMuted }} />
                  </div>
                </button>
              ))}
            </div>

            {/* Improvements teaser */}
            <Link
              to="/improvements"
              className="fade-in start-btn flex flex-col justify-between rounded-2xl p-6 lg:col-span-2"
              style={{ background: p.solid, color: p.inverse, animationDelay: "0.24s" }}
            >
              <div>
                <Lightbulb size={20} />
                <h2 className="mt-4 text-lg font-semibold tracking-tight">What to work on next</h2>
                <p className="mt-2 text-sm" style={{ opacity: 0.7 }}>
                  See your weakest roles, how consistent you are, and the interviewer's feedback, all in one place.
                </p>
              </div>
              <span className="mt-6 flex items-center gap-1.5 text-sm font-medium">
                Open improvements <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
