"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export type CalculatorVariant = "dark" | "light";

/** Paleta por superficie: la tienda usa el fondo oscuro y el panel interno el claro. */
export const calculatorThemes: Record<CalculatorVariant, CSSProperties> = {
  dark: {
    "--calc-bg": "#0d0c0f",
    "--calc-surface": "#151317",
    "--calc-panel": "#1b181f",
    "--calc-border": "rgba(255,255,255,0.11)",
    "--calc-text": "#ffffff",
    "--calc-muted": "#8f8b94",
    "--calc-accent": "#6f2fa3",
    "--calc-accent-soft": "rgba(111,47,163,0.16)",
    "--calc-accent-bright": "#a772ca",
    "--calc-good": "#34d399",
    "--calc-good-bg": "rgba(16,185,129,0.12)",
    "--calc-good-border": "rgba(16,185,129,0.35)",
    "--calc-bad": "#f87171",
    "--calc-bad-bg": "rgba(239,68,68,0.12)",
    "--calc-bad-border": "rgba(239,68,68,0.35)",
    "--calc-warn": "#fbbf24",
    "--calc-warn-bg": "rgba(245,158,11,0.12)",
    "--calc-warn-border": "rgba(245,158,11,0.35)",
    "--calc-shadow": "0 24px 80px rgba(0,0,0,0.45)",
  } as CSSProperties,
  light: {
    "--calc-bg": "#f5f2f8",
    "--calc-surface": "#ffffff",
    "--calc-panel": "#faf7fc",
    "--calc-border": "rgba(68,26,102,0.14)",
    "--calc-text": "#10091b",
    "--calc-muted": "#6b6472",
    "--calc-accent": "#6f2fa3",
    "--calc-accent-soft": "rgba(111,47,163,0.09)",
    "--calc-accent-bright": "#441a66",
    "--calc-good": "#047857",
    "--calc-good-bg": "rgba(5,150,105,0.09)",
    "--calc-good-border": "rgba(5,150,105,0.28)",
    "--calc-bad": "#b91c1c",
    "--calc-bad-bg": "rgba(185,28,28,0.08)",
    "--calc-bad-border": "rgba(185,28,28,0.26)",
    "--calc-warn": "#b45309",
    "--calc-warn-bg": "rgba(180,83,9,0.09)",
    "--calc-warn-border": "rgba(180,83,9,0.28)",
    "--calc-shadow": "0 18px 60px rgba(16,9,27,0.08)",
  } as CSSProperties,
};

export const inputClass =
  "w-full rounded-lg border border-[var(--calc-border)] bg-[var(--calc-bg)] px-3 py-2 text-sm font-semibold text-[var(--calc-text)] outline-none transition focus:border-[var(--calc-accent-bright)] focus:ring-1 focus:ring-[var(--calc-accent-bright)]";

export const selectClass = `${inputClass} appearance-none pr-8`;

export function Field({
  label,
  icon,
  tooltip,
  className,
  children,
}: {
  label: string;
  icon?: ReactNode;
  tooltip?: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        {icon ? <span className="text-[var(--calc-muted)]">{icon}</span> : null}
        <label className="flex items-center gap-1 text-sm font-semibold text-[var(--calc-text)]">
          {label}
          {tooltip ? (
            <span className="relative z-10 ml-1">
              <button
                type="button"
                aria-label={`Ayuda: ${label}`}
                onClick={() => setOpen((value) => !value)}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className="flex size-4 cursor-help items-center justify-center rounded-full border border-[var(--calc-border)] bg-[var(--calc-surface)] text-[10px] font-bold text-[var(--calc-muted)] transition hover:text-[var(--calc-text)]"
              >
                ?
              </button>
              {open ? (
                <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border border-[var(--calc-border)] bg-[var(--calc-surface)] p-3 text-xs font-medium leading-5 text-[var(--calc-text)] shadow-xl">
                  {tooltip}
                </span>
              ) : null}
            </span>
          ) : null}
        </label>
      </div>
      {children}
    </div>
  );
}

export function Collapsible({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--calc-border)] bg-[var(--calc-surface)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-[var(--calc-panel)]"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--calc-muted)] transition group-hover:text-[var(--calc-text)]">
          {icon}
          {title}
        </span>
        <Chevron className={`size-4 text-[var(--calc-muted)] transition ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Dona de costos dibujada con arcos SVG, sin dependencias externas. */
export function CostDonut({
  slices,
  total,
  label,
  format,
}: {
  slices: { name: string; value: number; color: string }[];
  total: number;
  label: string;
  format: (value: number) => string;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative size-48 shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        {total > 0 ? (
          slices.map((slice) => {
            const fraction = slice.value / total;
            const dash = Math.max(fraction * circumference - 2, 0);
            const circle = (
              <circle
                key={slice.name}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += fraction * circumference;
            return circle;
          })
        ) : (
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--calc-border)" strokeWidth="14" />
        )}
      </svg>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--calc-muted)]">{label}</p>
        <p className="mt-1 text-lg font-black text-[var(--calc-text)]">{format(total)}</p>
      </div>
    </div>
  );
}

export const donutColors = ["#8a62ab", "#6f2fa3", "#c4a6dd", "#441a66", "#b8b5bd"];

type IconProps = { className?: string };

function icon(path: ReactNode) {
  return function Icon({ className }: IconProps) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className ?? "size-4"}
      >
        {path}
      </svg>
    );
  };
}

export const Chevron = icon(<path d="m6 9 6 6 6-6" />);
export const PrinterIcon = icon(
  <>
    <path d="M6 9V3h12v6" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v7H6z" />
  </>,
);
export const ClockIcon = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
);
export const WeightIcon = icon(
  <>
    <circle cx="12" cy="5" r="2.5" />
    <path d="M8.5 8h7l3 12h-13z" />
  </>,
);
export const TagIcon = icon(
  <>
    <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z" />
    <circle cx="7.5" cy="7.5" r="1.2" />
  </>,
);
export const SparkIcon = icon(<path d="M13 2 4 14h7l-1 8 9-12h-7z" />);
export const SlidersIcon = icon(
  <>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </>,
);
export const WalletIcon = icon(
  <>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </>,
);
export const PiggyIcon = icon(
  <>
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
    <path d="M2 9v1c0 1.1.9 2 2 2h1" />
  </>,
);
export const TrendUpIcon = icon(
  <>
    <path d="m22 7-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
  </>,
);
export const TrendDownIcon = icon(
  <>
    <path d="m22 17-8.5-8.5-5 5L2 7" />
    <path d="M16 17h6v-6" />
  </>,
);
export const AlertIcon = icon(
  <>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h0" />
  </>,
);
export const BoltIcon = icon(<path d="M13 2 4 14h7l-1 8 9-12h-7z" />);
export const UserIcon = icon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </>,
);
export const LockIcon = icon(
  <>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>,
);
export const UnlockIcon = icon(
  <>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </>,
);
export const RefreshIcon = icon(
  <>
    <path d="M21 12a9 9 0 1 1-2.6-6.4" />
    <path d="M21 4v5h-5" />
  </>,
);
export const TargetIcon = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" />
  </>,
);
export const BoxIcon = icon(
  <>
    <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </>,
);
export const SunIcon = icon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>,
);
export const CalendarIcon = icon(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 11h18" />
  </>,
);
export const BookIcon = icon(
  <>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </>,
);
export const TableIcon = icon(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M9 10v10" />
  </>,
);
export const CoinIcon = icon(
  <>
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </>,
);
