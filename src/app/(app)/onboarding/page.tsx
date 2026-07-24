import { requireUser, getProfile } from "@/lib/auth-helpers";
import { toLanguage } from "@/lib/languages";
import { OnboardingClient } from "@/components/onboarding-client";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  // language was already chosen on the signup form; onboarding leads with it
  return <OnboardingClient initialLanguage={toLanguage(profile?.language)} />;
}
