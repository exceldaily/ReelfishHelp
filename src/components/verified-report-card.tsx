import Link from "next/link";
import { MapPin, Fish, CalendarDays } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { VerifiedTitleBadge } from "@/components/verified-badge";
import { titleDef } from "@/data/verified-titles";

export type VerifiedReportData = {
  id: string;
  titleSlug: string;
  generalArea: string;
  speciesText: string;
  body: string;
  fields: Record<string, string>;
  reportDate: Date;
  user: { profile: { username: string | null; displayName: string } | null };
  board: { slug: string; regionLabel: string } | null;
  species: { slug: string; commonName: string } | null;
};

const FIELD_LABEL: Record<string, string> = {
  method: "Method",
  bait: "Bait / lure working",
  conditions: "Conditions",
  tideNotes: "Tide notes",
  baitAvailability: "Bait availability",
  gearRecommendations: "Gear recommendations",
  localBiteNotes: "Local bite notes",
  shopNote: "Shop note",
  gearSetup: "Gear setup",
  techniqueNotes: "Technique notes",
  tournamentInsight: "Tournament insight",
};

/** Labeled report from a verified pro — shown on boards, species pages, profiles, home. */
export function VerifiedReportCard({ report, compact = false }: { report: VerifiedReportData; compact?: boolean }) {
  const def = titleDef(report.titleSlug);
  const author = report.user.profile;
  const fieldEntries = Object.entries(report.fields).filter(([k, v]) => FIELD_LABEL[k] && v && k !== "bookingCta");
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="dark">{def?.reportLabel ?? "Verified Report"}</Badge>
        <VerifiedTitleBadge slug={report.titleSlug} compact />
        {author?.username ? (
          <Link href={`/u/${author.username}`} className="text-sm font-bold text-tide-700 hover:underline">
            {author.displayName}
          </Link>
        ) : (
          <span className="text-sm font-bold text-ink-700">{author?.displayName ?? "Verified angler"}</span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-ink-500">
          <CalendarDays className="size-3.5" />
          {report.reportDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-ink-500">
        <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {report.generalArea}</span>
        {report.speciesText && (
          <span className="inline-flex items-center gap-1"><Fish className="size-3.5" /> {report.speciesText}</span>
        )}
        {report.board && (
          <Link href={`/boards/${report.board.slug}`} className="text-tide-700 hover:underline">{report.board.regionLabel}</Link>
        )}
        {report.species && (
          <Link href={`/fish/${report.species.slug}`} className="text-tide-700 hover:underline">{report.species.commonName} guide</Link>
        )}
      </p>
      <p className={`mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-700 ${compact ? "line-clamp-3" : ""}`}>{report.body}</p>
      {!compact && fieldEntries.length > 0 && (
        <dl className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {fieldEntries.map(([k, v]) => (
            <div key={k} className="text-xs">
              <dt className="font-bold uppercase tracking-wide text-ink-500">{FIELD_LABEL[k]}</dt>
              <dd className="mt-0.5 text-sm text-ink-700">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {!compact && report.fields.bookingCta && (
        <a
          href={report.fields.bookingCta}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-3 inline-flex min-h-9 items-center rounded-xl bg-bait-500 px-3.5 text-sm font-bold text-white hover:bg-bait-600"
        >
          Book a trip
        </a>
      )}
    </Card>
  );
}
