import type { NewGearArticle } from "@/db/schema";
import { rodArticles } from "./rods";
import { reelArticles } from "./reels";
import { lineArticles } from "./line";
import { leaderArticles } from "./leaders";
import { terminalArticles } from "./terminal";

export { rodArticles, rodGuideCards } from "./rods";
export { reelArticles, reelGuideCards } from "./reels";
export { lineArticles, lineComparisons, lineGuideCards } from "./line";
export { leaderArticles, leaderSetups } from "./leaders";
export { terminalArticles } from "./terminal";
export { knotData } from "./knots";
export { setupData } from "./setups";
export { brandData } from "./brands";
export { fishRequirementData } from "./fish-requirements";

/** All gear_articles (rods + reels + line + leaders + terminal) for seeding. */
export const allGearArticles: NewGearArticle[] = [
  ...rodArticles,
  ...reelArticles,
  ...lineArticles,
  ...leaderArticles,
  ...terminalArticles,
];

/** Human labels for the education categories used across the Gear hub. */
export const GEAR_CATEGORY_LABEL: Record<string, string> = {
  rod: "Rods",
  reel: "Reels",
  line: "Fishing Line",
  leader: "Leaders",
  terminal: "Terminal Tackle",
  concept: "Basics",
};
