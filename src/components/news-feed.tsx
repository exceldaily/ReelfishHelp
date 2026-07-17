import { ExternalLink, Newspaper } from "lucide-react";
import { Card, Badge, SectionTitle } from "@/components/ui";
import { industryNews } from "@/lib/news";

/** Curated industry headlines for the home right rail; entries live in src/lib/news.ts. */
export function NewsFeedCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <SectionTitle className="mb-0 flex items-center gap-2">
          <Newspaper className="size-4 text-tide-600" /> Industry News
        </SectionTitle>
        <Badge variant="orange">ICAST 2026</Badge>
      </div>
      <p className="text-xs text-ink-500 mb-2">Fresh gear news from the show floor in Orlando.</p>
      <div className="space-y-1">
        {industryNews.map((n) => (
          <a
            key={n.url}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg px-2.5 py-2 hover:bg-sand-100 transition-colors"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-ink-900 leading-snug">{n.title}</span>
              <ExternalLink className="size-3.5 shrink-0 mt-0.5 text-tide-600" />
            </span>
            <span className="mt-0.5 block text-xs text-ink-500">{n.blurb}</span>
            <span className="mt-0.5 block text-[11px] font-bold text-tide-700">{n.source}</span>
          </a>
        ))}
      </div>
    </Card>
  );
}
