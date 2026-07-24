"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Newspaper } from "lucide-react";
import { Card, Badge, SectionTitle } from "@/components/ui";
import { newsPages } from "@/lib/news";
import { t } from "@/lib/i18n";
import { DEFAULT_LANGUAGE, type LanguageCode } from "@/lib/languages";

const AUTO_FLIP_MS = 12000;

/**
 * Curated industry headlines for the home right rail; entries live in
 * src/lib/news.ts. Flips between pages on a timer until the reader touches
 * the pager, then stays put.
 */
export function NewsFeedCard({ lang = DEFAULT_LANGUAGE }: { lang?: LanguageCode } = {}) {
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const hoverRef = useRef(false);

  useEffect(() => {
    if (paused || newsPages.length < 2) return;
    const t = setInterval(() => {
      if (!hoverRef.current) setPage((p) => (p + 1) % newsPages.length);
    }, AUTO_FLIP_MS);
    return () => clearInterval(t);
  }, [paused]);

  const current = newsPages[page];
  const go = (next: number) => {
    setPaused(true);
    setPage((next + newsPages.length) % newsPages.length);
  };

  return (
    <Card
      className="p-5"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <SectionTitle className="mb-0 flex items-center gap-2">
          <Newspaper className="size-4 text-tide-600" /> {t(lang, "news.title")}
        </SectionTitle>
        <Badge variant="orange">{current.label}</Badge>
      </div>
      <p className="text-xs text-ink-500 mb-2">{current.tagline}</p>
      <div key={page} className="space-y-1 news-page-in">
        {current.items.map((n) => (
          <a
            key={n.url}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg px-2.5 py-2 transition-colors hover:bg-sand-50"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold leading-snug text-ink-900 transition-colors group-hover:text-tide-600">
                {n.title}
              </span>
              <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-ink-300 transition-colors group-hover:text-reef-600" />
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{n.blurb}</span>
            <span className="mt-1 block text-[10px] font-extrabold uppercase tracking-wider text-reef-600">
              {n.source}
            </span>
          </a>
        ))}
      </div>

      {newsPages.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => go(page - 1)}
            aria-label="Previous news page"
            className="grid size-8 place-items-center rounded-full text-ink-500 hover:bg-sand-100 hover:text-ink-900"
          >
            <ChevronLeft className="size-4" />
          </button>
          {newsPages.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => go(i)}
              aria-label={`News page ${i + 1}: ${p.label}`}
              aria-current={i === page}
              className={`size-2.5 rounded-full transition-colors ${i === page ? "bg-tide-600" : "bg-sand-300 hover:bg-sand-400"}`}
            />
          ))}
          <button
            type="button"
            onClick={() => go(page + 1)}
            aria-label="Next news page"
            className="grid size-8 place-items-center rounded-full text-ink-500 hover:bg-sand-100 hover:text-ink-900"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      <p className="mt-2 border-t border-sand-100 pt-2.5 text-[10px] leading-relaxed text-ink-400">
        ReelFishHelp is an independent fishing community and is not affiliated with, sponsored by, or
        endorsed by any of the publications, brands, events, or organizations linked above. Headlines
        open third-party sites. All trademarks, including ICAST, a trademark of the American
        Sportfishing Association, belong to their respective owners.
      </p>
    </Card>
  );
}
