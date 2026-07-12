import Link from "next/link";
import { type ReactNode, type ComponentProps } from "react";

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------- buttons ------------------------------- */

const btnBase =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-500 disabled:opacity-50 disabled:pointer-events-none select-none";
const btnSizes = {
  sm: "text-sm px-3 py-1.5 min-h-9",
  md: "text-sm px-4 py-2.5 min-h-11",
  lg: "text-base px-6 py-3 min-h-12",
};
const btnVariants = {
  primary: "bg-bait-500 text-white hover:bg-bait-600 active:bg-bait-700 shadow-card",
  dark: "bg-tide-900 text-white hover:bg-tide-800 shadow-card",
  secondary: "bg-tide-100 text-tide-800 hover:bg-tide-200",
  outline: "border border-sand-300 bg-white text-ink-900 hover:bg-sand-100",
  ghost: "text-tide-700 hover:bg-tide-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

type BtnStyle = { variant?: keyof typeof btnVariants; size?: keyof typeof btnSizes };

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & BtnStyle) {
  return (
    <button
      className={cx(btnBase, btnSizes[size], btnVariants[variant], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & BtnStyle) {
  return (
    <Link className={cx(btnBase, btnSizes[size], btnVariants[variant], className)} {...props} />
  );
}

/* -------------------------------- cards -------------------------------- */

export function Card({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cx("bg-white rounded-2xl shadow-card border border-sand-200/70", className)}
      {...props}
    />
  );
}

/* -------------------------------- badges ------------------------------- */

const badgeVariants = {
  fresh: "bg-moss-100 text-moss-700",
  salt: "bg-tide-100 text-tide-700",
  both: "bg-sand-200 text-ink-700",
  neutral: "bg-sand-100 text-ink-700",
  orange: "bg-bait-100 text-bait-700",
  dark: "bg-tide-900 text-white",
  outline: "border border-sand-300 text-ink-500",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { variant?: keyof typeof badgeVariants }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export function WaterBadge({ water }: { water: string }) {
  if (water === "both") return <Badge variant="both">Fresh + Salt</Badge>;
  return water === "saltwater" ? (
    <Badge variant="salt">Saltwater</Badge>
  ) : (
    <Badge variant="fresh">Freshwater</Badge>
  );
}

export function DifficultyDots({ level }: { level: number }) {
  const labels = ["", "Easy", "Easy-moderate", "Moderate", "Challenging", "Expert"];
  return (
    <span className="inline-flex items-center gap-1.5" title={`Difficulty: ${labels[level]}`}>
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cx(
              "size-1.5 rounded-full",
              i <= level ? "bg-bait-500" : "bg-sand-200"
            )}
          />
        ))}
      </span>
      <span className="text-xs text-ink-500">{labels[level]}</span>
    </span>
  );
}

/* -------------------------------- forms -------------------------------- */

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label className={cx("block text-sm font-semibold text-ink-700 mb-1.5", className)} {...props} />
  );
}

const fieldBase =
  "w-full rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 text-[15px] text-ink-900 placeholder:text-ink-300 focus:outline-2 focus:outline-tide-500 min-h-11";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(fieldBase, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cx(fieldBase, "appearance-none pr-8", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cx(fieldBase, "min-h-24", className)} {...props} />;
}

export function FieldError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {children}
    </p>
  );
}

/* ------------------------------ page bits ------------------------------ */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-500 max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cx("font-display text-lg font-bold text-ink-900 mb-3", className)}>{children}</h2>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-10 text-center">
      {icon && <div className="mx-auto mb-3 text-ink-300 [&>svg]:size-10 [&>svg]:mx-auto">{icon}</div>}
      <h3 className="font-display font-bold text-ink-900">{title}</h3>
      {body && <p className="mt-1 text-sm text-ink-500 max-w-md mx-auto">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </Card>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-block size-5 rounded-full border-2 border-tide-300 border-t-tide-700 animate-spin",
        className
      )}
      aria-label="Loading"
    />
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl bg-sand-100/70 px-3.5 py-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-0.5 font-display text-lg font-bold text-ink-900 leading-tight">{value}</div>
      {hint && <div className="text-xs text-ink-500 mt-0.5">{hint}</div>}
    </div>
  );
}
