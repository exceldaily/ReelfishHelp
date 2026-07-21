export type NewsItem = {
  title: string;
  source: string;
  url: string;
  blurb: string;
};

export type NewsPage = {
  /** Badge text shown at the top of the card while this page is active. */
  label: string;
  /** One-line intro under the card title. */
  tagline: string;
  items: NewsItem[];
};

/**
 * Curated industry news for the home page right rail, split into pages the
 * card flips through. Newest first within a page. Update by editing this
 * list; links open in a new tab.
 */
export const newsPages: NewsPage[] = [
  {
    label: "ICAST 2026",
    tagline: "Fresh gear news from the show floor in Orlando.",
    items: [
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
    ],
  },
  {
    label: "Hot right now",
    tagline: "Records, big money, and the gear making waves beyond the show floor.",
    items: [
      {
        title: "919.9 lb blue marlin rewrites Big Rock history",
        source: "Marlin Magazine",
        url: "https://www.marlinmag.com/tournaments/big-rock-blue-marlin-tournament-2026-results/",
        blurb: "Marlin Fever's tournament-record fish holds through the final day and hauls in $6.5 million.",
      },
      {
        title: "New IGFA world records for July 2026",
        source: "IGFA",
        url: "https://igfa.org/2026/07/17/world-records-for-july-2026/",
        blurb: "Fresh all-tackle length records, including a kelp bass pulled off Santa Monica.",
      },
      {
        title: "The biggest winners from the New Product Showcase",
        source: "GearJunkie",
        url: "https://gearjunkie.com/fishing/biggest-winners-icast-2026-new-product-showcase",
        blurb: "39 award winners across rods, reels, electronics, watercraft and more.",
      },
      {
        title: "Lighter reels, smarter rods and conservation tools",
        source: "The Outdoor Wire",
        url: "https://www.theoutdoorwire.com/features/2026/07/icast-2026-new-reels-rods-lures-and-conservation-tools-highlight-this-years-show/",
        blurb: "Abu Garcia's Revo VoltiQ brings digital cast control, Daiwa's Tatula MQ drops to 6.7 oz.",
      },
      {
        title: "Day one: the most exciting new gear of 2026",
        source: "Kayak Angler",
        url: "https://kayakanglermag.com/stories/news-events/icast-2026-day-one/",
        blurb: "A first-look tour of what turned heads when the doors opened.",
      },
    ],
  },
];
