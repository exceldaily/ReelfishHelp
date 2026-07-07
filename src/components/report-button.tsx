"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag, Check } from "lucide-react";
import { reportContent } from "@/lib/actions/catch-actions";
import { REPORT_REASONS } from "@/lib/constants";

/** Generic report control for a profile, catch, comment, spot, or message. */
export function ReportButton({
  targetType,
  targetId,
  signedIn,
  label = "Report",
  className = "",
}: {
  targetType: "catch" | "comment" | "profile" | "spot" | "message";
  targetId: string;
  signedIn: boolean;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [, start] = useTransition();

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500">
        <Check className="size-3.5" /> Report received
      </span>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => {
          if (!signedIn) return router.push("/login");
          setOpen((v) => !v);
        }}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-red-600"
      >
        <Flag className="size-3.5" /> {label}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-lift border border-sand-200 py-1.5 z-30">
          <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-300">
            Why are you reporting this?
          </div>
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => {
                setOpen(false);
                setDone(true);
                start(() => {
                  reportContent({ targetType, targetId, reason: r }).catch(() => {});
                });
              }}
              className="w-full text-left px-3.5 py-2 text-sm hover:bg-sand-100"
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
