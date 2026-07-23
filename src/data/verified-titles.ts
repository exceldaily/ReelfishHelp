/**
 * The four supported verified titles — nothing else, by design. This catalog
 * drives the request form, admin review, badges, professional profiles, and
 * verified report labels, so the system stays focused and consistent.
 */
export const VERIFIED_TITLE_SLUGS = ["fishing_guide", "tackle_shop", "tournament_angler", "charter_captain"] as const;
export type VerifiedTitleSlug = (typeof VERIFIED_TITLE_SLUGS)[number];

export type TitleField = {
  id: string;
  label: string;
  type: "text" | "textarea";
  required?: boolean;
  placeholder?: string;
};

export type VerifiedTitleDef = {
  slug: VerifiedTitleSlug;
  /** short label shown next to names */
  badgeLabel: string;
  /** full label used on pickers and admin screens */
  label: string;
  description: string;
  reportLabel: string;
  /** title-specific application questions (stored in request.details) */
  fields: TitleField[];
  /** whether the business-name field applies and what to call it */
  businessNameLabel: string | null;
};

export const VERIFIED_TITLES: VerifiedTitleDef[] = [
  {
    slug: "fishing_guide",
    badgeLabel: "Fishing Guide",
    label: "Fishing Guide",
    description: "For people who guide fishing trips, teach anglers, or professionally help others fish.",
    reportLabel: "Guide Report",
    businessNameLabel: "Guide business name",
    fields: [
      { id: "yearsGuiding", label: "Years guiding", type: "text", required: true, placeholder: "e.g. 8" },
      { id: "targetSpecies", label: "Target species", type: "text", required: true, placeholder: "Redfish, snook, tarpon…" },
      { id: "fishingStyles", label: "Fishing styles", type: "text", required: true, placeholder: "Inshore, offshore, fly, kayak, surf, pier…" },
      { id: "proof", label: "Proof of guide work (website, license, or social presence)", type: "textarea", required: true, placeholder: "Links to your site, license info, guide pages…" },
    ],
  },
  {
    slug: "charter_captain",
    badgeLabel: "Charter Captain",
    label: "Charter Captain",
    description: "For licensed captains running fishing charters.",
    reportLabel: "Captain Report",
    businessNameLabel: "Charter business name",
    fields: [
      { id: "vesselName", label: "Vessel name (optional)", type: "text" },
      { id: "homePort", label: "Home port", type: "text", required: true, placeholder: "e.g. Pensacola, FL" },
      { id: "licenseNumber", label: "License number (or upload license proof below)", type: "text", placeholder: "USCG credential #" },
      { id: "yearsOperating", label: "Years operating", type: "text", required: true },
      { id: "targetSpecies", label: "Target species", type: "text", required: true },
      { id: "tripTypes", label: "Trip types", type: "text", required: true, placeholder: "Half day, full day, offshore, inshore…" },
    ],
  },
  {
    slug: "tackle_shop",
    badgeLabel: "Verified Tackle Shop",
    label: "Tackle Shop",
    description: "For tackle shops, bait shops, and fishing retailers sharing local info, bait availability, and gear recommendations.",
    reportLabel: "Shop Report",
    businessNameLabel: "Shop name",
    fields: [
      { id: "shopAddress", label: "Shop address", type: "text", required: true },
      { id: "shopPhone", label: "Shop phone", type: "text", required: true },
      { id: "brandsCarried", label: "Brands carried (optional)", type: "text" },
      { id: "specialties", label: "Fishing specialties", type: "text", required: true, placeholder: "Inshore, fly tying, live bait…" },
      { id: "proof", label: "Proof of business ownership or staff role", type: "textarea", required: true, placeholder: "Business listing, website, how you're connected to the shop…" },
    ],
  },
  {
    slug: "tournament_angler",
    badgeLabel: "Tournament Angler",
    label: "Tournament Angler",
    description: "For anglers who actively compete in tournaments and can share competitive fishing knowledge.",
    reportLabel: "Tournament Insight",
    businessNameLabel: "Team name (optional)",
    fields: [
      { id: "circuits", label: "Tournament circuits or events", type: "text", required: true, placeholder: "e.g. IFA Redfish Tour, local kayak series" },
      { id: "mainSpecies", label: "Main species", type: "text", required: true },
      { id: "history", label: "Tournament history", type: "textarea", required: true, placeholder: "Events fished, seasons competing…" },
      { id: "notableFinishes", label: "Notable finishes (optional)", type: "textarea" },
      { id: "proofLinks", label: "Proof (links, photos, or screenshots)", type: "textarea", required: true, placeholder: "Results pages, team pages, coverage…" },
    ],
  },
];

export function titleDef(slug: string): VerifiedTitleDef | null {
  return VERIFIED_TITLES.find((t) => t.slug === slug) ?? null;
}

export function isVerifiedTitleSlug(slug: string): slug is VerifiedTitleSlug {
  return (VERIFIED_TITLE_SLUGS as readonly string[]).includes(slug);
}

export const REQUEST_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  needs_more_info: "Needs More Info",
  approved: "Approved",
  rejected: "Rejected",
};
