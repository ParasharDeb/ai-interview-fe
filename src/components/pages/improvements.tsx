import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  Gauge,
  Layers,
  Lightbulb,
  MessageSquareQuote,
  Rocket,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { usePalette } from "../../lib/palette";
import { useUserData, type ScoredInterview } from "../../lib/useUserData";
import { PageHeader, PageLoading } from "../ui/pageHeader";

const DAY = 24 * 60 * 60 * 1000;

type Tip = { icon: ReactNode; title: string; body: string; link?: { to: string; label: string } };

const mean = (xs: number[]) => xs.reduce((sum, x) => sum + x, 0) / xs.length;

function stdDev(xs: number[]) {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

function topicOf(interview: ScoredInterview) {
  return interview.role || "General";
}

export default function ImprovementsPage() {
  const p = usePalette();
  const { scored, loading } = useUserData();
  const [now] = useState(() => Date.now());

  const insights = useMemo(() => {
    if (scored.length === 0) return null;

    const scores = scored.map((i) => i.score);
    const overall = mean(scores);

    // Momentum: last 3 interviews against the 3 before them.
    const recent = Math.min(3, Math.floor(scored.length / 2));
    const momentum =
      recent > 0 ? Math.round(mean(scores.slice(-recent)) - mean(scores.slice(-2 * recent, -recent))) : null;

    const spread = scored.length > 1 ? Math.round(stdDev(scores)) : null;

    const lastAt = new Date(scored[scored.length - 1].createdAt).getTime();
    const daysSinceLast = Math.floor((now - lastAt) / DAY);
    const last30 = scored.filter((i) => now - new Date(i.createdAt).getTime() <= 30 * DAY).length;

    const byTopic = Object.entries(
      scored.reduce<Record<string, number[]>>((acc, i) => {
        (acc[topicOf(i)] ??= []).push(i.score);
        return acc;
      }, {}),
    )
      .map(([topic, xs]) => ({ topic, avg: Math.round(mean(xs)), count: xs.length }))
      .sort((a, b) => a.avg - b.avg);

    const toReview = [...scored].sort((a, b) => a.score - b.score).slice(0, 3);
    const withFeedback = scored.filter((i) => i.feedback?.trim()).reverse();

    return { overall: Math.round(overall), momentum, spread, daysSinceLast, last30, byTopic, toReview, withFeedback };
  }, [scored, now]);

  const tips = useMemo<Tip[]>(() => {
    if (!insights) return [];
    const { overall, momentum, spread, daysSinceLast, byTopic, toReview } = insights;
    const list: Tip[] = [];

    if (byTopic.length > 1 && overall - byTopic[0].avg >= 5) {
      list.push({
        icon: <Layers size={16} />,
        title: `Focus on ${byTopic[0].topic}`,
        body: `You average ${byTopic[0].avg} here, ${overall - byTopic[0].avg} points below your overall ${overall}. Another round on this topic will help most.`,
      });
    }
    if (momentum !== null && momentum <= -5) {
      list.push({
        icon: <TrendingDown size={16} />,
        title: "Recent scores are slipping",
        body: `Your latest interviews are ${Math.abs(momentum)} points lower than the ones before. Re-read your lowest transcript and note where your answers lost depth.`,
        link: { to: `/interviews?id=${toReview[0].id}`, label: "Open lowest transcript" },
      });
    }
    if (overall < 50) {
      list.push({
        icon: <Lightbulb size={16} />,
        title: "Strengthen the fundamentals",
        body: "Structure each answer: restate the question, explain your approach, then talk through trade-offs and edge cases before you finish.",
      });
    }
    if (spread !== null && spread >= 15) {
      list.push({
        icon: <Gauge size={16} />,
        title: "Make your performance more consistent",
        body: `Your scores vary by about ±${spread} points. Use the same answer structure every time so a hard question doesn't knock you off course.`,
      });
    }
    if (daysSinceLast >= 7) {
      list.push({
        icon: <CalendarClock size={16} />,
        title: "Get back into practice",
        body: `It's been ${daysSinceLast} days since your last scored interview. Short, regular sessions build skill faster than occasional long ones.`,
        link: { to: "/information", label: "Start an interview" },
      });
    }
    if (overall >= 80) {
      list.push({
        icon: <Rocket size={16} />,
        title: "Raise the bar",
        body: `You're averaging ${overall}. Try a more complex project or a more senior-level role to keep stretching yourself.`,
        link: { to: "/information", label: "Start a harder interview" },
      });
    }
    if (list.length === 0) {
      list.push({
        icon: <TrendingUp size={16} />,
        title: "You're on a steady path",
        body: "No weak spots stand out right now. Keep practising regularly and review the transcripts below to sharpen your answers.",
      });
    }
    return list;
  }, [insights]);

  const card = { background: p.panel, border: `1px solid ${p.border}` };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-8">
      <PageHeader
        eyebrow="Improvements"
        title="What to work on next"
        subtitle="Patterns from your scored interviews, and where you'll gain the most."
      />

      {loading ? (
        <PageLoading label="Analysing your interviews..." />
      ) : !insights ? (
        <div className="fade-in flex flex-col items-center gap-3 rounded-2xl px-6 py-20 text-center" style={card}>
          <Activity size={22} style={{ color: p.textMuted }} />
          <p className="text-sm" style={{ color: p.textMuted }}>
            Finish your first interview and it will appear here with suggestions.
          </p>
          <Link
            to="/information"
            className="start-btn mt-2 rounded-lg px-4 py-2 text-sm font-medium"
            style={{ background: p.solid, color: p.inverse }}
          >
            Start an interview
          </Link>
        </div>
      ) : (
        <>
          {/* Headline metrics */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: insights.momentum !== null && insights.momentum < 0 ? <TrendingDown size={15} /> : <TrendingUp size={15} />,
                label: "Momentum",
                value:
                  insights.momentum === null ? "—" : `${insights.momentum > 0 ? "+" : ""}${insights.momentum}`,
                sub:
                  insights.momentum === null
                    ? "Needs at least 2 scored interviews"
                    : insights.momentum >= 5
                      ? "Improving: recent interviews vs the ones before"
                      : insights.momentum <= -5
                        ? "Slipping: recent interviews vs the ones before"
                        : "Holding steady",
              },
              {
                icon: <Gauge size={15} />,
                label: "Consistency",
                value: insights.spread === null ? "—" : `±${insights.spread}`,
                sub:
                  insights.spread === null
                    ? "Needs at least 2 scored interviews"
                    : insights.spread < 8
                      ? "Very consistent"
                      : insights.spread < 15
                        ? "Some variance between interviews"
                        : "Scores swing a lot",
              },
              {
                icon: <CalendarClock size={15} />,
                label: "Practice in last 30 days",
                value: String(insights.last30),
                sub:
                  insights.daysSinceLast === 0
                    ? "Last interview was today"
                    : `Last interview ${insights.daysSinceLast} day${insights.daysSinceLast === 1 ? "" : "s"} ago`,
              },
            ].map((m, index) => (
              <div
                key={m.label}
                className="fade-in rounded-2xl p-5"
                style={{ ...card, animationDelay: `${0.04 + index * 0.03}s` }}
              >
                <div className="mb-3 flex items-center gap-2 text-xs font-medium" style={{ color: p.textMuted }}>
                  {m.icon}
                  {m.label}
                </div>
                <div className="text-3xl font-semibold tracking-tight tabular-nums">{m.value}</div>
                <div className="mt-1.5 text-xs" style={{ color: p.textMuted }}>
                  {m.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Focus areas */}
          <section className="fade-in mb-6" style={{ animationDelay: "0.14s" }}>
            <h2 className="mb-3 text-sm font-medium">Focus areas</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tips.map((tip) => (
                <div key={tip.title} className="flex flex-col rounded-2xl p-5" style={card}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: p.panelAlt }}
                    >
                      {tip.icon}
                    </span>
                    <span className="text-sm font-semibold">{tip.title}</span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: p.textMuted }}>
                    {tip.body}
                  </p>
                  {tip.link && (
                    <Link to={tip.link.to} className="icon-btn mt-4 flex items-center gap-1 text-xs font-medium">
                      {tip.link.label} <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Score by topic */}
            <section className="fade-in rounded-2xl p-6" style={{ ...card, animationDelay: "0.18s" }}>
              <h2 className="text-sm font-medium">Average score by topic</h2>
              <p className="mt-1 text-xs" style={{ color: p.textMuted }}>
                Weakest first. Dashed line marks your overall average ({insights.overall}).
              </p>
              <div className="mt-5 space-y-4">
                {insights.byTopic.map((t) => (
                  <div key={t.topic}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate">{t.topic}</span>
                      <span className="flex-shrink-0 tabular-nums">
                        <span className="font-semibold">{t.avg}</span>
                        <span className="text-xs" style={{ color: p.textMuted }}>
                          {" "}
                          · {t.count} interview{t.count === 1 ? "" : "s"}
                        </span>
                      </span>
                    </div>
                    <div className="relative h-2 w-full rounded-full" style={{ background: p.panelAlt }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${t.avg}%`, background: p.textPrimary }}
                      />
                      <div
                        className="absolute -top-1 -bottom-1"
                        style={{ left: `${insights.overall}%`, borderLeft: `1.5px dashed ${p.textMuted}` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Lowest scores to review */}
            <section className="fade-in overflow-hidden rounded-2xl" style={{ ...card, animationDelay: "0.22s" }}>
              <div className="px-6 pb-3 pt-6">
                <h2 className="text-sm font-medium">Worth reviewing</h2>
                <p className="mt-1 text-xs" style={{ color: p.textMuted }}>
                  Your lowest-scoring interviews. Re-read them to spot the answers that cost you points.
                </p>
              </div>
              {insights.toReview.map((i) => (
                <Link
                  key={i.id}
                  to={`/interviews?id=${i.id}`}
                  className="row-btn flex items-center justify-between gap-3 px-6 py-3.5"
                  style={{ borderTop: `1px solid ${p.border}` }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{topicOf(i)}</div>
                    <div className="mt-0.5 text-xs" style={{ color: p.textMuted }}>
                      {new Date(i.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums" style={{ background: p.panelAlt }}>
                      {i.score}
                    </span>
                    <ArrowRight size={14} style={{ color: p.textMuted }} />
                  </div>
                </Link>
              ))}
            </section>
          </div>

          {/* Interviewer feedback */}
          <section className="fade-in rounded-2xl p-6" style={{ ...card, animationDelay: "0.26s" }}>
            <div className="flex items-center gap-2">
              <MessageSquareQuote size={16} style={{ color: p.textMuted }} />
              <h2 className="text-sm font-medium">Interviewer feedback</h2>
            </div>
            {insights.withFeedback.length === 0 ? (
              <p className="mt-3 text-sm" style={{ color: p.textMuted }}>
                No written feedback yet. Any feedback the interviewer writes after scoring will appear here.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {insights.withFeedback.map((i) => (
                  <Link
                    key={i.id}
                    to={`/interviews?id=${i.id}`}
                    className="row-btn block rounded-xl p-4"
                    style={{ background: p.panelAlt }}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs" style={{ color: p.textMuted }}>
                      <span className="truncate">
                        {topicOf(i)} · {new Date(i.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-semibold tabular-nums" style={{ color: p.textPrimary }}>
                        {i.score}/100
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{i.feedback}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
