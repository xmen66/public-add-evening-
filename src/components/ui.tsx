import { useEffect, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";

/* ---------- Icons (inline SVG, stroke based) ---------- */

const ICON_PATHS = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </>
  ),
  layers: (
    <>
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </>
  ),
  bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  chart: (
    <>
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </>
  ),
  pen: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M1 14h6M9 8h6M17 16h6" />
    </>
  ),
  play: <path d="M6 4l14 8-14 8V4z" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="M20 6 9 17l-5-5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
  arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5M12 15V3" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  refresh: (
    <>
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </>
  ),
  shuffle: (
    <>
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </>
  ),
  star: <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  skip: (
    <>
      <path d="M5 4l10 8-10 8V4z" />
      <path d="M19 5v14" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </>
  ),
  xcircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12.6a10 10 0 0 1 14 0M8.5 16.1a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0" />
      <path d="M12 20h.01" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  flag: (
    <>
      <path d="M4 22V4" />
      <path d="M4 4h12l-2 4 2 4H4" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5 shrink-0", className)}
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ---------- Surfaces ---------- */

export function Card({
  className,
  interactive = false,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl",
        "dark:border-white/[0.08] dark:bg-slate-900/70 dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]",
        interactive &&
          "transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-14px_rgba(79,70,229,0.28)] dark:hover:shadow-[0_16px_36px_-14px_rgba(99,102,241,0.35)]",
        className,
      )}
      {...rest}
    />
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; block?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        size === "sm" && "min-h-10 px-3.5 text-sm",
        size === "md" && "min-h-12 px-5 text-[0.95rem]",
        size === "lg" && "min-h-14 px-6 text-base",
        variant === "primary" &&
          "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:brightness-110",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800",
        variant === "soft" &&
          "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-200 dark:hover:bg-indigo-500/25",
        variant === "ghost" &&
          "text-slate-600 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-white/10",
        variant === "danger" &&
          "bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-500",
        block && "w-full",
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-600 transition duration-200 hover:bg-slate-900/5 active:scale-95 dark:text-slate-300 dark:hover:bg-white/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type Tone = "slate" | "indigo" | "emerald" | "rose" | "amber" | "sky" | "violet";

const TONES: Record<Tone, string> = {
  slate: "bg-slate-900/[0.06] text-slate-700 dark:bg-white/10 dark:text-slate-200",
  indigo: "bg-indigo-500/12 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200",
  violet: "bg-violet-500/12 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200",
  emerald: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
  rose: "bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200",
  amber: "bg-amber-500/15 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  sky: "bg-sky-500/12 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
};

export function Chip({
  tone = "slate",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Progress ---------- */

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName = "bg-gradient-to-r from-indigo-500 to-violet-500",
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}) {
  const pctValue = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-slate-900/[0.07] dark:bg-white/10", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pctValue)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", barClassName)}
        style={{ width: `${pctValue}%` }}
      />
    </div>
  );
}

export function Ring({
  fraction,
  size = 96,
  stroke = 9,
  className,
  children,
  colorClass = "text-indigo-500",
}: {
  fraction: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
  colorClass?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const f = Math.min(1, Math.max(0, fraction));
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-900/[0.08] dark:stroke-white/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", colorClass)}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - f)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/* ---------- Layout helpers ---------- */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">{eyebrow}</p>
        )}
        <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: IconName;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
        <Icon name={icon} className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex w-full items-center gap-1 rounded-2xl bg-slate-900/[0.06] p-1 dark:bg-white/[0.07]",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition duration-200",
              active
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            {o.icon && <Icon name={o.icon} className="h-4 w-4" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl p-1 text-left"
    >
      <span className="min-w-0">
        <span className="block font-semibold text-slate-900 dark:text-white">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
      <span
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition duration-300",
          checked ? "bg-gradient-to-r from-indigo-600 to-violet-600" : "bg-slate-300 dark:bg-slate-700",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition duration-300",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

/* ---------- Bottom sheet / dialog ---------- */

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border border-white/60 bg-white shadow-2xl animate-sheet-up sm:rounded-3xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-slate-300 sm:hidden dark:bg-slate-700" />
        <div className="flex items-center justify-between px-6 pb-2 pt-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <Icon name="x" />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2">{children}</div>
      </div>
    </div>
  );
}
