import Link from "next/link";
import { eq } from "drizzle-orm";
import { ImageIcon } from "lucide-react";
import { requireUser, getProfile } from "@/lib/auth-helpers";
import { getDb, species } from "@/db";
import { getUsage } from "@/lib/media";
import { formatBytes } from "@/lib/storage-admin";
import { PageHeader, Card } from "@/components/ui";
import { SettingsForm } from "@/components/settings-form";
import { AccountDeletion } from "@/components/account-deletion";
import { redirect } from "next/navigation";

export const metadata = { title: "Profile & Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const db = await getDb();
  const [allSpecies, usage] = await Promise.all([
    db.query.species.findMany({ where: eq(species.active, true) }),
    getUsage(user.id),
  ]);
  const pct = Math.min(100, Math.round(usage.ratio * 100));

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Profile & Settings"
        subtitle="Your public profile, fishing preferences, and privacy controls."
      />

      <Link href="/settings/photos" className="block mb-6">
        <Card className="p-4 hover:shadow-lift transition-shadow flex items-center gap-4">
          <span className="size-10 rounded-xl bg-tide-100 grid place-items-center shrink-0">
            <ImageIcon className="size-5 text-tide-700" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-ink-900">Photos &amp; storage</span>
              <span className={`text-sm font-bold ${usage.nearQuota ? "text-red-600" : "text-ink-500"}`}>
                {formatBytes(usage.totalBytes)} / {formatBytes(usage.quotaBytes)}
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-sand-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${usage.nearQuota ? "bg-red-500" : "bg-tide-500"}`}
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
            <span className="text-xs text-ink-500">{usage.photoCount} photo{usage.photoCount === 1 ? "" : "s"} · manage or delete →</span>
          </div>
        </Card>
      </Link>
      <SettingsForm
        profile={{
          displayName: profile.displayName,
          username: profile.username,
          bio: profile.bio,
          homeState: profile.homeState,
          waterPref: profile.waterPref,
          experience: profile.experience,
          visibility: profile.visibility,
          locationMode: profile.locationMode,
          fishingStyles: profile.fishingStyles,
          favoriteSpecies: profile.favoriteSpecies,
          avatarUrl: profile.avatarUrl,
          lastLocationLabel: profile.lastLocationLabel,
        }}
        speciesOptions={allSpecies
          .map((s) => ({ id: s.id, name: s.commonName }))
          .sort((a, b) => a.name.localeCompare(b.name))}
      />
      <div className="mt-6">
        <AccountDeletion />
      </div>
    </div>
  );
}
