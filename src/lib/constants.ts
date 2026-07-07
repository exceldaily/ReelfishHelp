export const GEAR_CATEGORIES = [
  "rod", "reel", "combo", "line", "leader", "hooks", "lures", "tackle box",
  "electronics", "kayak", "boat", "motor", "net", "other",
] as const;

export const WATER_TYPES = [
  "lake", "pond", "river", "creek", "canal", "inshore", "flats", "marsh",
  "beach", "surf", "pier", "jetty", "nearshore", "offshore",
] as const;

export const CATCH_METHODS = ["shore", "boat", "kayak", "pier", "surf", "wading", "ice"] as const;

export const REPORT_REASONS = [
  "Spam or advertising",
  "Harassment or abuse",
  "Illegal fish harvest",
  "Exposes someone's private spot",
  "Inappropriate content",
  "Other",
] as const;
