import { eq } from "drizzle-orm";
import { requireUser, getProfile } from "@/lib/auth-helpers";
import { getDb, species } from "@/db";
import { PageHeader } from "@/components/ui";
import { SettingsForm } from "@/components/settings-form";
import { redirect } from "next/navigation";

export const metadata = { title: "Profile & Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const db = await getDb();
  const allSpecies = await db.query.species.findMany({ where: eq(species.active, true) });

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Profile & Settings"
        subtitle="Your public profile, fishing preferences, and privacy controls."
      />
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
    </div>
  );
}
