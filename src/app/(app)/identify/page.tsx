import { redirect } from "next/navigation";
import { fishIdEnabled } from "@/lib/flags";
import { IdentifyView } from "@/components/identify-view";

export const metadata = { title: "Identify a Fish" };

export default function IdentifyPage() {
  // Hidden until ANTHROPIC_API_KEY is configured — see src/lib/flags.ts
  if (!fishIdEnabled()) redirect("/fish");
  return <IdentifyView />;
}
