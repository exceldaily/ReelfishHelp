import { auth } from "@/auth";
import { getProfile } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/ui";
import { ConditionsView } from "@/components/conditions-view";

export const metadata = { title: "Fishing Conditions" };

export default async function ConditionsPage() {
  const session = await auth();
  const profile = session?.user ? await getProfile(session.user.id) : null;
  const initialCoords =
    profile?.lastLat != null && profile?.lastLng != null
      ? { lat: profile.lastLat, lng: profile.lastLng }
      : null;

  return (
    <div>
      <PageHeader
        title="Conditions"
        subtitle="Live weather, wind, pressure, moon, and real NOAA tides — rolled into a practical fishing outlook for your water."
      />
      <ConditionsView initialCoords={initialCoords} initialLabel={profile?.lastLocationLabel ?? null} />
    </div>
  );
}
