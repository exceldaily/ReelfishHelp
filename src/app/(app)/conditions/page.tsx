import { auth } from "@/auth";
import { getProfile } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/ui";
import { ConditionsView } from "@/components/conditions-view";
import { regionMeta, toRegion } from "@/lib/regions";
import { toLanguage } from "@/lib/languages";
import { t } from "@/lib/i18n";

export const metadata = { title: "Fishing Conditions" };

export default async function ConditionsPage() {
  const session = await auth();
  const profile = session?.user ? await getProfile(session.user.id) : null;
  const meta = regionMeta(toRegion(profile?.region));
  const lang = toLanguage(profile?.language);
  const initialCoords =
    profile?.lastLat != null && profile?.lastLng != null
      ? { lat: profile.lastLat, lng: profile.lastLng }
      : null;

  return (
    <div>
      <PageHeader
        title={t(lang, "page.conditionsTitle")}
        subtitle={meta.hasTides ? t(lang, "page.conditionsSubtitleTides") : t(lang, "page.conditionsSubtitleNoTides")}
      />
      <ConditionsView initialCoords={initialCoords} initialLabel={profile?.lastLocationLabel ?? null} />
    </div>
  );
}
