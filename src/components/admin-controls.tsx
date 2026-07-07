"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, X, Trash2 } from "lucide-react";
import { resolveReport, adminRemoveContent, toggleSpeciesActive } from "@/lib/actions/admin-actions";
import { Card, Badge } from "@/components/ui";

export function AdminReportRow({
  report,
}: {
  report: { id: string; targetType: string; targetId: string; reason: string; details: string | null; createdAt: string };
}) {
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <Card className="p-4 text-sm text-ink-500">
        Report {done} — {report.reason}
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="orange" className="capitalize">{report.targetType}</Badge>
        <span className="font-bold text-sm text-ink-900">{report.reason}</span>
        <span className="text-xs text-ink-300">{new Date(report.createdAt).toLocaleString()}</span>
        {report.targetType === "catch" && (
          <Link href={`/catch/${report.targetId}`} className="text-xs font-bold text-tide-700 hover:underline">
            View content →
          </Link>
        )}
        <div className="ml-auto flex gap-2">
          <button
            disabled={pending}
            onClick={() =>
              start(async () => {
                await resolveReport(report.id, "resolved");
                setDone("resolved");
              })
            }
            className="inline-flex items-center gap-1 rounded-lg bg-moss-100 text-moss-700 px-3 py-1.5 text-xs font-bold hover:bg-moss-300/50"
          >
            <Check className="size-3.5" /> Resolve
          </button>
          <button
            disabled={pending}
            onClick={() =>
              start(async () => {
                await resolveReport(report.id, "dismissed");
                setDone("dismissed");
              })
            }
            className="inline-flex items-center gap-1 rounded-lg bg-sand-100 text-ink-700 px-3 py-1.5 text-xs font-bold hover:bg-sand-200"
          >
            <X className="size-3.5" /> Dismiss
          </button>
          {(report.targetType === "catch" || report.targetType === "comment") && (
            <button
              disabled={pending}
              onClick={() => {
                if (!confirm("Remove this content permanently?")) return;
                start(async () => {
                  await adminRemoveContent(report.targetType, report.targetId);
                  await resolveReport(report.id, "resolved");
                  setDone("resolved (content removed)");
                });
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-red-50 text-red-700 px-3 py-1.5 text-xs font-bold hover:bg-red-100"
            >
              <Trash2 className="size-3.5" /> Remove content
            </button>
          )}
        </div>
      </div>
      {report.details && <p className="mt-2 text-sm text-ink-700">{report.details}</p>}
    </Card>
  );
}

export function SpeciesActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [isActive, setIsActive] = useState(active);
  const [, start] = useTransition();
  return (
    <button
      onClick={() => {
        setIsActive(!isActive);
        start(() => {
          toggleSpeciesActive(id);
        });
      }}
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        isActive ? "bg-moss-100 text-moss-700" : "bg-sand-200 text-ink-500"
      }`}
    >
      {isActive ? "Active" : "Hidden"}
    </button>
  );
}
