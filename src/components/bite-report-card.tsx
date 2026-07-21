import Image from "next/image";
import Link from "next/link";
import { Clock, Fish, MapPin, MessageSquareText, Waves } from "lucide-react";
import { Badge } from "@/components/ui";

export type BiteReportCardData = {
  id: string;
  speciesName: string;
  outcome: string;
  bait: string | null;
  method: string | null;
  timeOfDay: string | null;
  notes: string | null;
  photoUrl: string | null;
  broadAreaLabel: string | null;
  createdAt: Date | string;
  board?: { slug: string; name: string } | null;
  author?: { username: string; displayName: string } | null;
};

export function BiteReportCard({ report }: { report: BiteReportCardData }) {
  return (
    <article className="bg-card rounded-2xl border border-edge shadow-card overflow-hidden">
      {report.photoUrl ? (
        <div className="relative h-44 bg-tide-950">
          <Image
            src={report.photoUrl}
            alt={report.speciesName}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            unoptimized={report.photoUrl.startsWith("/api/")}
          />
        </div>
      ) : (
        <div className="h-28 bg-gradient-to-br from-tide-800 to-tide-950 grid place-items-center">
          <Fish className="size-9 text-tide-400/70" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-ink-900">{report.speciesName}</h3>
            {report.author && (
              <p className="text-xs text-ink-500">
                by <span className="font-semibold">{report.author.displayName}</span> @{report.author.username}
              </p>
            )}
          </div>
          <Badge variant={report.outcome === "caught" ? "fresh" : "neutral"} className="capitalize">
            {report.outcome}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-ink-500">
          {report.broadAreaLabel && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {report.broadAreaLabel}
            </span>
          )}
          {report.method && (
            <span className="inline-flex items-center gap-1 capitalize">
              <Waves className="size-3.5" />
              {report.method}
            </span>
          )}
          {report.timeOfDay && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {report.timeOfDay}
            </span>
          )}
        </div>

        {report.bait && <p className="mt-2 text-sm text-ink-700">Bait/lure: {report.bait}</p>}
        {report.notes && (
          <p className="mt-2 flex gap-2 text-sm text-ink-600 leading-relaxed">
            <MessageSquareText className="size-4 shrink-0 text-tide-600 mt-0.5" />
            <span>{report.notes}</span>
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
          <span>{new Date(report.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
          {report.board && (
            <Link href={`/boards/${report.board.slug}`} className="font-semibold text-tide-700 hover:text-tide-900">
              {report.board.name}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
