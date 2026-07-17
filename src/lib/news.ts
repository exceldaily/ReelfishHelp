export type NewsItem = {
  title: string;
  source: string;
  url: string;
  blurb: string;
};

/**
 * Curated industry news for the home page right rail.
 * Newest first. Update by editing this list; links open in a new tab.
 */
export const industryNews: NewsItem[] = [
  {
    title: "Rhino 30 spinning combo named Best of Show",
    source: "The Fishing Wire",
    url: "https://thefishingwire.com/rhino-spinning-combo-named-best-of-show-at-icast-2026/",
    blurb: "Rather Outdoors takes the top award with its sealed, torque-focused Rhino 30 combo.",
  },
  {
    title: "Every 2026 Best of Category winner",
    source: "Wired2Fish",
    url: "https://www.wired2fish.com/icast/and-the-winner-is-2026-icast-best-of-category-winners",
    blurb: "St. Croix, Rapala, Simms and more take home category wins in Orlando.",
  },
  {
    title: "Official New Product Showcase winners",
    source: "ICAST",
    url: "https://www.icastfishing.org/new-product-showcase/2026-winners/",
    blurb: "The full winners list straight from the show.",
  },
  {
    title: "Demo Day: Garmin LiveScope 2 leads the pack",
    source: "Kayak Angler",
    url: "https://kayakanglermag.com/stories/news-events/icast-2026-demo-day/",
    blurb: "Sharper live sonar with no black box, plus an 8 mph kayak motor from ePropulsion.",
  },
  {
    title: "New releases and video coverage from the floor",
    source: "Tackle Warehouse",
    url: "https://www.tacklewarehouse.com/catpage-ICAST.html",
    blurb: "Rolling coverage of new rods, reels and baits as they drop.",
  },
  {
    title: "2026 ICAST new products preview",
    source: "Bassmaster",
    url: "https://www.bassmaster.com/gear/slideshow/2026-icast-new-products-preview/",
    blurb: "A slideshow tour of the gear that made noise before the doors opened.",
  },
];
