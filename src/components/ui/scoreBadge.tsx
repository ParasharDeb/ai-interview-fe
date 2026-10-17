import { usePalette } from "../../lib/palette";
import { isScored, type InterviewSummary } from "../../lib/useUserData";

const STATUS_LABEL: Record<NonNullable<InterviewSummary["status"]>, string> = {
  Pre: "Not started",
  Inprocess: "In progress",
  Marking: "Scoring…",
  Ended: "Not scored",
};

export function ScoreBadge({ interview, active = false }: { interview: InterviewSummary; active?: boolean }) {
  const p = usePalette();

  if (isScored(interview)) {
    return (
      <span
        className="rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums"
        style={{ background: active ? p.panel : p.panelAlt }}
      >
        {interview.score}
      </span>
    );
  }

  if (!interview.status) return null;

  return (
    <span className="text-xs" style={{ color: p.textMuted }}>
      {STATUS_LABEL[interview.status]}
    </span>
  );
}
