import { desc, eq } from "drizzle-orm";
import { getDb, gearItems } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/ui";
import { BobberDecor } from "@/components/decor";
import { GearView } from "@/components/gear-view";

export const metadata = { title: "My Gear" };

export default async function MyGearPage() {
  const user = await requireUser();
  const db = await getDb();
  const items = await db.query.gearItems.findMany({
    where: eq(gearItems.userId, user.id),
    orderBy: [desc(gearItems.favorite), desc(gearItems.createdAt)],
  });

  return (
    <div className="relative">
      <BobberDecor className="absolute -top-2 right-2 hidden sm:block w-24 lg:w-28 text-tide-200" />
      <PageHeader
        title="My Gear"
        subtitle="Your rods, reels, tackle, and boats — plus a wishlist you can fill straight from the catch guides."
      />
      <GearView items={items} />
    </div>
  );
}
