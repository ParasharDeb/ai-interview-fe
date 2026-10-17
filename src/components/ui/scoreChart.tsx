import { useEffect, useRef, useState } from "react";

export type ScorePoint = {
  id: string;
  date: string;
  score: number;
  label: string;
};

type ScoreChartProps = {
  points: ScorePoint[];
  isDark: boolean;
  onSelect?: (id: string) => void;
};

const HEIGHT = 260;
const PAD = { top: 16, right: 16, bottom: 32, left: 36 };
const Y_TICKS = [0, 25, 50, 75, 100];

function formatDate(date: Date, withYear = false) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

// Line + area chart of interview scores (0-100) plotted on a real time axis,
// with a crosshair tooltip that snaps to the nearest interview.
export function ScoreChart({ points, isDark, onSelect }: ScoreChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const line = isDark ? "#f4f4f5" : "#18181b";
  const grid = isDark ? "#232328" : "#ececef";
  const axis = isDark ? "#8b8b93" : "#71717a";
  const surface = isDark ? "#131316" : "#ffffff";
  const tooltipBg = isDark ? "#f4f4f5" : "#18181b";
  const tooltipText = isDark ? "#18181b" : "#f4f4f5";
  const gradientId = isDark ? "score-fill-dark" : "score-fill-light";

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  const times = points.map((p) => new Date(p.date).getTime());
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const span = maxT - minT;

  const x = (t: number) => (span === 0 ? PAD.left + innerW / 2 : PAD.left + ((t - minT) / span) * innerW);
  const y = (score: number) => PAD.top + innerH - (Math.max(0, Math.min(100, score)) / 100) * innerH;

  const coords = points.map((p, i) => ({ x: x(times[i]), y: y(p.score) }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const areaPath =
    coords.length > 1
      ? `${linePath} L${coords[coords.length - 1].x},${PAD.top + innerH} L${coords[0].x},${PAD.top + innerH} Z`
      : "";

  // Keep date labels at least MIN_GAP px apart; the latest interview always gets one.
  const spansYears = new Date(minT).getFullYear() !== new Date(maxT).getFullYear();
  const MIN_GAP = spansYears ? 110 : 80;
  const labelIdx: number[] = [];
  coords.forEach((c, i) => {
    const last = labelIdx[labelIdx.length - 1];
    if (last === undefined || c.x - coords[last].x >= MIN_GAP) labelIdx.push(i);
  });
  const lastIdx = points.length - 1;
  if (lastIdx > 0 && labelIdx[labelIdx.length - 1] !== lastIdx) {
    if (coords[lastIdx].x - coords[labelIdx[labelIdx.length - 1]].x < MIN_GAP && labelIdx.length > 1) labelIdx.pop();
    labelIdx.push(lastIdx);
  }
  const xLabels = labelIdx.map((i) => ({ i, date: new Date(points[i].date) }));

  function handleMove(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left + PAD.left;
    let nearest = 0;
    coords.forEach((c, i) => {
      if (Math.abs(c.x - px) < Math.abs(coords[nearest].x - px)) nearest = i;
    });
    setHoverIndex(nearest);
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const hoveredCoord = hoverIndex !== null ? coords[hoverIndex] : null;
  const prev = hoverIndex !== null && hoverIndex > 0 ? points[hoverIndex - 1] : null;
  const delta = hovered && prev ? hovered.score - prev.score : null;

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`Interview scores over time, ${points.length} interviews`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={line} stopOpacity={isDark ? 0.18 : 0.1} />
            <stop offset="100%" stopColor={line} stopOpacity={0} />
          </linearGradient>
        </defs>

        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={PAD.left + innerW} y1={y(tick)} y2={y(tick)} stroke={grid} strokeWidth={1} />
            <text x={PAD.left - 10} y={y(tick)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill={axis}>
              {tick}
            </text>
          </g>
        ))}

        {xLabels.map(({ i, date }) => (
          <text
            key={points[i].id}
            x={coords[i].x}
            y={HEIGHT - 10}
            textAnchor={span === 0 ? "middle" : i === 0 ? "start" : i === lastIdx ? "end" : "middle"}
            fontSize={11}
            fill={axis}
          >
            {formatDate(date, spansYears)}
          </text>
        ))}

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        {coords.length > 1 && (
          <path d={linePath} fill="none" stroke={line} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        )}

        {hoveredCoord && (
          <line
            x1={hoveredCoord.x}
            x2={hoveredCoord.x}
            y1={PAD.top}
            y2={PAD.top + innerH}
            stroke={axis}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        {coords.map((c, i) => (
          <circle
            key={points[i].id}
            cx={c.x}
            cy={c.y}
            r={i === hoverIndex ? 5.5 : points.length > 40 ? 0 : 3.5}
            fill={i === hoverIndex ? line : surface}
            stroke={line}
            strokeWidth={2}
            style={{ transition: "r 0.12s ease" }}
          />
        ))}

        <rect
          x={PAD.left - 8}
          y={PAD.top}
          width={innerW + 16}
          height={innerH}
          fill="transparent"
          style={{ cursor: onSelect ? "pointer" : "default" }}
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIndex(null)}
          onClick={() => hovered && onSelect?.(hovered.id)}
        />
      </svg>

      {hovered && hoveredCoord && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{
            background: tooltipBg,
            color: tooltipText,
            left: Math.min(Math.max(hoveredCoord.x, 70), width - 70),
            top: hoveredCoord.y - 12,
            transform: "translate(-50%, -100%)",
            whiteSpace: "nowrap",
          }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold tabular-nums">{hovered.score}</span>
            <span style={{ opacity: 0.6 }}>/ 100</span>
            {delta !== null && delta !== 0 && (
              <span className="tabular-nums" style={{ opacity: 0.75 }}>
                {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}
              </span>
            )}
          </div>
          <div className="mt-0.5" style={{ opacity: 0.7 }}>
            {hovered.label} · {formatDate(new Date(hovered.date), true)}
          </div>
        </div>
      )}
    </div>
  );
}
