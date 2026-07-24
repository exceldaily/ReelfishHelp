import { auth } from "@/auth";
import { getProfile } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/ui";
import { ConditionsView } from "@/components/conditions-view";
import { regionMeta, toRegion } from "@/lib/regions";

export const metadata = { title: "Fishing Conditions" };

export default async function ConditionsPage() {
  const session = await auth();
  const profile = session?.user ? await getProfile(session.user.id) : null;
  const meta = regionMeta(toRegion(profile?.region));
  const initialCoords =
    profile?.lastLat != null && profile?.lastLng != null
      ? { lat: profile.lastLat, lng: profile.lastLng }
      : null;

  return (
    <div>
      <PageHeader
        title="Conditions"
        subtitle={
          meta.hasTides
            ? "Live weather, wind, pressure, moon, and real NOAA tides — rolled into a practical fishing outlook for your water."
            : "Live weather, wind, pressure, and moon — rolled into a practical fishing outlook for your water. Tide predictions aren't available in your region yet."
        }
      />
      <ConditionsView initialCoords={initialCoords} initialLabel={profile?.lastLocationLabel ?? null} />
    </div>
  );
}
