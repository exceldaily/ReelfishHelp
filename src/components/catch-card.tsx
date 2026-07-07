import Link from "next/link";
import Image from "next/image";
import { Fish, Heart, MessageCircle, MapPin, Ruler, Weight } from "lucide-react";
import { Badge } from "@/components/ui";

export type CatchCardData = {
  id: string;
  speciesName: string;
  photoUrl: string | null;
  caughtAt: Date | string;
  lengthIn: number | null;
  weightLb: number | null;
  bait: string | null;
  released: boolean;
  visibility: string;
  locationLabel: string | null;
  showLocation: boolean;
  author?: { username: string; displayName: string; avatarUrl: string | null } | null;
  likeCount?: number;
  commentCount?: number;
};

export function CatchCard({ c }: { c: CatchCardData }) {
  return (
    <Link
      href={`/catch/${c.id}`}
      className="group bg-white rounded-2xl border border-sand-200 shadow-card overflow-hidden hover:shadow-lift transition-shadow"
    >
      <div className="relative h-52 bg-gradient-to-br from-tide-800 to-tide-950">
        {c.photoUrl ? (
          <Image
            src={c.photoUrl}
            alt={c.speciesName}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            unoptimized={c.photoUrl.startsWith("/api/")}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Fish className="size-10 text-tide-500/60" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {c.released ? <Badge variant="fresh">Released</Badge> : <Badge variant="neutral">Kept</Badge>}
          {c.visibility !== "public" && (
            <Badge variant="dark" className="capitalize">{c.visibility === "followers" ? "Followers" : "Private"}</Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-ink-900 group-hover:text-tide-700 transition-colors">
            {c.speciesName}
          </h3>
          <span className="text-xs text-ink-300 whitespace-nowrap">
            {new Date(c.caughtAt).toLocaleDateString([], { month: "short", day: "numeric" })}
          </span>
        </div>
        {c.author && (
          <div className="mt-1 text-xs text-ink-500">
            by <span className="font-semibold">{c.author.displayName}</span> @{c.author.username}
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          {c.lengthIn != null && (
            <span className="inline-flex items-center gap-1"><Ruler className="size-3.5" />{c.lengthIn}&quot;</span>
          )}
          {c.weightLb != null && (
            <span className="inline-flex items-center gap-1"><Weight className="size-3.5" />{c.weightLb} lb</span>
          )}
          {c.showLocation && c.locationLabel && (
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{c.locationLabel}</span>
          )}
        </div>
        {c.bait && <div className="mt-1.5 text-xs text-ink-500 truncate">🪱 {c.bait}</div>}
        {(c.likeCount !== undefined || c.commentCount !== undefined) && (
          <div className="mt-2.5 flex items-center gap-4 text-xs font-semibold text-ink-500">
            <span className="inline-flex items-center gap-1"><Heart className="size-3.5" />{c.likeCount ?? 0}</span>
            <span className="inline-flex items-center gap-1"><MessageCircle className="size-3.5" />{c.commentCount ?? 0}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
