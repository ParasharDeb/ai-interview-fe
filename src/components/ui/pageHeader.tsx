import type { ReactNode } from "react";
import { usePalette } from "../../lib/palette";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
  const p = usePalette();

  return (
    <div className="fade-in mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.textPrimary }} />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: p.textMuted }}>
            {eyebrow}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm" style={{ color: p.textMuted }}>
          {subtitle}
        </p>
      </div>
      {action}
    </div>
  );
}

export function PageLoading({ label }: { label: string }) {
  const p = usePalette();

  return (
    <div className="flex items-center justify-center gap-2 py-24" style={{ color: p.textMuted }}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
