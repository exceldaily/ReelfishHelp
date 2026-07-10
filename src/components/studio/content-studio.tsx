"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Clapperboard,
  MessageSquareText,
  MessagesSquare,
  Star,
  LayoutTemplate,
  KanbanSquare,
  Copy,
  Check,
  Save,
  Trash2,
  Film,
  ListChecks,
  Hash,
  Info,
} from "lucide-react";
import { Button, Card, Badge, Input, Select, Textarea, Label } from "@/components/ui";
import {
  runGenerateIdeas,
  runGenerateCaptions,
  runGenerateComments,
  runGenerateHighlight,
  saveContentItem,
  updateContentStage,
  deleteContentItem,
  type SaveContentInput,
} from "@/lib/actions/content-studio-actions";
import type { GeneratedIdea, GeneratedCaptions, GeneratedHighlight } from "@/lib/content-studio/generate";
import type { ContentStage } from "@/db";

/* ------------------------------- prop types ------------------------------- */

type StudioItem = {
  id: string;
  kind: string;
  platform: string | null;
  stage: ContentStage;
  title: string;
  hook: string | null;
  script15: string | null;
  script30: string | null;
  overlays: string[];
  visuals: string[];
  cta: string | null;
  hashtags: string[];
  caption: string | null;
  captions: Record<string, string> | null;
  comments: string[];
  shotList: string[];
  brollTerms: string[];
  screenSteps: string[];
  templateSlug: string | null;
  notes: string | null;
  createdAt: string;
};

type TemplateProp = {
  slug: string;
  name: string;
  description: string;
  beats: string[];
  defaultHook: string;
  defaultCta: string;
  suggestedHashtags: string[];
  brollTerms: string[];
  lengthHint: string;
  grounding: string;
};

type FeatureProp = {
  key: string;
  name: string;
  path: string;
  blurb: string;
  talkingPoints: string[];
  screenSteps: string[];
  brollTerms: string[];
  suggestedHashtags: string[];
};

type CatchProp = {
  id: string;
  species: string | null;
  lengthIn: number | null;
  weightLb: number | null;
  method: string | null;
  bait: string | null;
  handle: string;
  displayName: string;
};

type Props = {
  items: StudioItem[];
  aiConfigured: boolean;
  templates: TemplateProp[];
  features: FeatureProp[];
  broll: { key: string; label: string; terms: string[] }[];
  context: {
    season: string;
    month: string;
    popularSpecies: { slug: string; name: string; water: string }[];
    setups: { slug: string; name: string }[];
    activeCrews: { slug: string; name: string; members: number }[];
    featurableCatches: CatchProp[];
  };
};

/* --------------------------------- labels --------------------------------- */

const STAGE_LABELS: Record<ContentStage, string> = {
  idea: "Idea",
  "in-progress": "In progress",
  recorded: "Recorded",
  edited: "Edited",
  posted: "Posted",
  "reuse-later": "Reuse later",
};
const STAGES = Object.keys(STAGE_LABELS) as ContentStage[];

const KIND_LABELS: Record<string, string> = {
  idea: "Idea",
  "feature-demo": "Feature demo",
  caption: "Captions",
  "comment-pack": "Comments",
  highlight: "Highlight",
  template: "Template",
};

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube Shorts",
  facebook: "Facebook",
  multi: "All platforms",
};

const TABS = [
  { key: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { key: "ideas", label: "Idea Generator", icon: Sparkles },
  { key: "features", label: "Feature Demos", icon: Clapperboard },
  { key: "captions", label: "Captions", icon: MessageSquareText },
  { key: "comments", label: "Comment Assistant", icon: MessagesSquare },
  { key: "highlights", label: "Highlights", icon: Star },
  { key: "templates", label: "Templates", icon: LayoutTemplate },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ------------------------------ small helpers ----------------------------- */

function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {
          /* clipboard blocked; ignore */
        }
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-sand-300 bg-white px-2.5 py-1.5 text-xs font-bold text-ink-700 hover:bg-sand-100 ${className ?? ""}`}
    >
      {done ? <Check className="size-3.5 text-moss-600" /> : <Copy className="size-3.5" />}
      {done ? "Copied" : label}
    </button>
  );
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <span key={i} className="rounded-md bg-sand-100 px-2 py-1 text-xs text-ink-700">
          {t}
        </span>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500 mb-1">{label}</div>
      {children}
    </div>
  );
}

/** Assemble a full copy-ready export package from a saved item or a draft. */
function buildExportText(x: {
  title: string;
  hook?: string | null;
  script15?: string | null;
  script30?: string | null;
  overlays?: string[];
  visuals?: string[];
  cta?: string | null;
  caption?: string | null;
  captions?: Record<string, string> | null;
  hashtags?: string[];
  shotList?: string[];
  brollTerms?: string[];
  screenSteps?: string[];
  comments?: string[];
}): string {
  const L: string[] = [];
  L.push(x.title);
  L.push("");
  if (x.hook) L.push(`HOOK: ${x.hook}`);
  if (x.script15) L.push("", "15-SECOND SCRIPT:", x.script15);
  if (x.script30) L.push("", "30-SECOND SCRIPT:", x.script30);
  if (x.overlays?.length) L.push("", "TEXT OVERLAYS:", ...x.overlays.map((o) => `- ${o}`));
  if (x.visuals?.length) L.push("", "VISUALS:", ...x.visuals.map((o) => `- ${o}`));
  if (x.screenSteps?.length) L.push("", "SCREEN RECORDING STEPS:", ...x.screenSteps.map((s, i) => `${i + 1}. ${s}`));
  if (x.shotList?.length) L.push("", "SHOT LIST:", ...x.shotList.map((s, i) => `${i + 1}. ${s}`));
  if (x.brollTerms?.length) L.push("", "B-ROLL SEARCHES:", ...x.brollTerms.map((b) => `- ${b}`));
  if (x.cta) L.push("", `CTA: ${x.cta}`);
  if (x.caption) L.push("", "CAPTION:", x.caption);
  if (x.captions) {
    L.push("", "CAPTIONS BY PLATFORM:");
    for (const [k, v] of Object.entries(x.captions)) {
      if (v) L.push(`[${PLATFORM_LABELS[k] ?? k}] ${v}`);
    }
  }
  if (x.comments?.length) L.push("", "COMMENT OPTIONS:", ...x.comments.map((c) => `- ${c}`));
  if (x.hashtags?.length) L.push("", "HASHTAGS:", x.hashtags.join(" "));
  return L.join("\n").trim();
}

function useSaver() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [savedId, setSavedId] = useState<string | null>(null);
  function save(input: SaveContentInput) {
    start(async () => {
      const res = await saveContentItem(input);
      if (res.ok) {
        setSavedId(res.data.id);
        router.refresh();
        setTimeout(() => setSavedId(null), 1600);
      }
    });
  }
  return { save, pending, savedId };
}

function SaveButton({ onClick, pending, saved }: { onClick: () => void; pending: boolean; saved: boolean }) {
  return (
    <Button type="button" variant="secondary" size="sm" onClick={onClick} disabled={pending}>
      {saved ? <Check className="size-4" /> : <Save className="size-4" />}
      {saved ? "Saved to pipeline" : pending ? "Saving…" : "Save to pipeline"}
    </Button>
  );
}

function AiOffNotice() {
  return (
    <Card className="p-4 flex items-start gap-3 bg-bait-100/50 border-bait-400/40">
      <Info className="size-5 text-bait-600 shrink-0 mt-0.5" />
      <p className="text-sm text-ink-700">
        AI writing is off until an <code className="text-xs">ANTHROPIC_API_KEY</code> is added to the site (same key the
        fish ID uses). Add it and redeploy to turn on idea, caption, comment, and highlight generation. The Feature Demos,
        Templates, b-roll, and Pipeline all work without it.
      </p>
    </Card>
  );
}

/* ================================ main view =============================== */

export function ContentStudio(props: Props) {
  const [tab, setTab] = useState<TabKey>(props.items.length ? "pipeline" : "ideas");
  const [ideaFocus, setIdeaFocus] = useState("");

  return (
    <div>
      {/* tab bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          const count = key === "pipeline" ? props.items.length : undefined;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-bold transition-colors ${
                active ? "bg-tide-900 text-white shadow-card" : "bg-white border border-sand-200 text-ink-700 hover:bg-sand-100"
              }`}
            >
              <Icon className="size-4" />
              {label}
              {count != null && (
                <span className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20" : "bg-sand-100 text-ink-500"}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "pipeline" && <PipelineTab items={props.items} />}
      {tab === "ideas" && (
        <IdeasTab aiConfigured={props.aiConfigured} focus={ideaFocus} setFocus={setIdeaFocus} context={props.context} />
      )}
      {tab === "features" && <FeaturesTab features={props.features} />}
      {tab === "captions" && <CaptionsTab aiConfigured={props.aiConfigured} />}
      {tab === "comments" && <CommentsTab aiConfigured={props.aiConfigured} />}
      {tab === "highlights" && (
        <HighlightsTab aiConfigured={props.aiConfigured} catches={props.context.featurableCatches} />
      )}
      {tab === "templates" && (
        <TemplatesTab
          templates={props.templates}
          onUseForIdeas={(t) => {
            setIdeaFocus(`Use the "${t.name}" template: ${t.description}`);
            setTab("ideas");
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------- pipeline --------------------------------- */

function PipelineTab({ items }: { items: StudioItem[] }) {
  if (!items.length) {
    return (
      <Card className="p-10 text-center">
        <KanbanSquare className="size-10 mx-auto text-ink-300" />
        <h3 className="mt-3 font-display font-bold text-ink-900">Nothing saved yet</h3>
        <p className="mt-1 text-sm text-ink-500 max-w-md mx-auto">
          Generate ideas, plan a feature demo, or start from a template, then save it here to track it from idea to posted.
        </p>
      </Card>
    );
  }
  const byStage = STAGES.map((s) => ({ stage: s, list: items.filter((i) => i.stage === s) }));
  return (
    <div className="space-y-6">
      {byStage.map(({ stage, list }) =>
        list.length === 0 ? null : (
          <div key={stage}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-500 mb-2">
              {STAGE_LABELS[stage]} <span className="text-ink-300">({list.length})</span>
            </h3>
            <div className="space-y-2.5">
              {list.map((item) => (
                <PipelineRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function PipelineRow({ item }: { item: StudioItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const exportText = useMemo(() => buildExportText(item), [item]);

  function setStage(stage: ContentStage) {
    start(async () => {
      await updateContentStage(item.id, stage);
      router.refresh();
    });
  }
  function remove() {
    if (!confirm("Delete this content item?")) return;
    start(async () => {
      await deleteContentItem(item.id);
      router.refresh();
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <button onClick={() => setOpen((v) => !v)} className="text-left">
            <span className="font-display font-bold text-ink-900">{item.title}</span>
          </button>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="dark">{KIND_LABELS[item.kind] ?? item.kind}</Badge>
            {item.platform && <Badge variant="salt">{PLATFORM_LABELS[item.platform] ?? item.platform}</Badge>}
            {item.templateSlug && <Badge variant="neutral">{item.templateSlug}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={item.stage}
            onChange={(e) => setStage(e.target.value as ContentStage)}
            disabled={pending}
            className="min-h-9 py-1.5 text-sm w-36"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </Select>
          <button onClick={remove} disabled={pending} className="grid place-items-center size-9 rounded-lg text-red-600 hover:bg-red-50" aria-label="Delete">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 border-t border-sand-100 pt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <CopyButton text={exportText} label="Copy full package" />
            {item.caption && <CopyButton text={item.caption} label="Copy caption" />}
            {item.hashtags.length > 0 && <CopyButton text={item.hashtags.join(" ")} label="Copy hashtags" />}
          </div>
          <pre className="whitespace-pre-wrap rounded-xl bg-sand-50 border border-sand-200 p-3.5 text-sm text-ink-700 max-h-96 overflow-y-auto font-sans">
            {exportText}
          </pre>
        </div>
      )}
    </Card>
  );
}

/* --------------------------------- ideas ---------------------------------- */

function IdeasTab({
  aiConfigured,
  focus,
  setFocus,
  context,
}: {
  aiConfigured: boolean;
  focus: string;
  setFocus: (v: string) => void;
  context: Props["context"];
}) {
  const [count, setCount] = useState(3);
  const [pending, start] = useTransition();
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [error, setError] = useState<string | null>(null);

  function generate() {
    setError(null);
    start(async () => {
      const res = await runGenerateIdeas({ focus, count });
      if (res.ok) setIdeas(res.data);
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-5">
      {!aiConfigured && <AiOffNotice />}
      <Card className="p-5">
        <p className="text-sm text-ink-500 mb-3">
          Fresh short-form ideas grounded in your species, gear, knots, crews, and app features. It's {context.month} ({context.season}), so seasonal angles are in play.
        </p>
        <Label htmlFor="focus">Focus (optional)</Label>
        <Input
          id="focus"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="e.g. redfish in the marsh, braid-to-leader knots, Setup Builder, what's biting in Florida"
        />
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="count">How many</Label>
            <Select id="count" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-24">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
          </div>
          <Button type="button" onClick={generate} disabled={pending || !aiConfigured}>
            <Sparkles className="size-4" />
            {pending ? "Generating…" : "Generate ideas"}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      </Card>

      {ideas.map((idea, i) => (
        <IdeaCard key={i} idea={idea} />
      ))}
    </div>
  );
}

function IdeaCard({ idea }: { idea: GeneratedIdea }) {
  const { save, pending, savedId } = useSaver();
  const exportText = buildExportText(idea);
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-ink-900">{idea.title}</h3>
          <div className="mt-1"><Badge variant="salt">{PLATFORM_LABELS[idea.platform] ?? idea.platform}</Badge></div>
        </div>
        <div className="flex gap-2">
          <CopyButton text={exportText} label="Copy package" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Hook"><p className="text-sm text-ink-900 font-medium">{idea.hook}</p></Field>
        <Field label="Call to action"><p className="text-sm text-ink-700">{idea.cta}</p></Field>
        <Field label="15-second script"><p className="text-sm text-ink-700 whitespace-pre-wrap">{idea.script15}</p></Field>
        <Field label="30-second script"><p className="text-sm text-ink-700 whitespace-pre-wrap">{idea.script30}</p></Field>
        <Field label="Text overlays"><Chips items={idea.overlays} /></Field>
        <Field label="Visuals"><Chips items={idea.visuals} /></Field>
        <Field label="B-roll searches"><Chips items={idea.brollTerms} /></Field>
        <Field label="Hashtags"><Chips items={idea.hashtags} /></Field>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <SaveButton
          pending={pending}
          saved={!!savedId}
          onClick={() =>
            save({
              kind: "idea",
              platform: idea.platform,
              title: idea.title,
              hook: idea.hook,
              script15: idea.script15,
              script30: idea.script30,
              overlays: idea.overlays,
              visuals: idea.visuals,
              cta: idea.cta,
              hashtags: idea.hashtags,
              brollTerms: idea.brollTerms,
            })
          }
        />
      </div>
    </Card>
  );
}

/* ------------------------------ feature demos ----------------------------- */

function FeaturesTab({ features }: { features: FeatureProp[] }) {
  const [activeKey, setActiveKey] = useState(features[0]?.key ?? "");
  const feature = features.find((f) => f.key === activeKey) ?? features[0];
  const { save, pending, savedId } = useSaver();
  if (!feature) return null;

  const draft = {
    title: `App demo: ${feature.name}`,
    hook: feature.talkingPoints[0],
    screenSteps: feature.screenSteps,
    brollTerms: feature.brollTerms,
    hashtags: feature.suggestedHashtags,
    cta: "It's free in ReelFishHelp.",
    visuals: feature.talkingPoints,
  };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <Label htmlFor="feature">Pick a feature</Label>
        <Select id="feature" value={activeKey} onChange={(e) => setActiveKey(e.target.value)}>
          {features.map((f) => (
            <option key={f.key} value={f.key}>{f.name}</option>
          ))}
        </Select>
      </Card>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
              <Film className="size-5 text-tide-600" /> {feature.name}
            </h3>
            <p className="mt-1 text-sm text-ink-500">{feature.blurb}</p>
            <code className="text-xs text-ink-300">{feature.path}</code>
          </div>
          <CopyButton text={buildExportText(draft)} label="Copy package" />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Talking points">
            <ul className="text-sm text-ink-700 space-y-1 list-disc pl-4">
              {feature.talkingPoints.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </Field>
          <div className="space-y-4">
            <Field label="Screen recording checklist">
              <ol className="text-sm text-ink-700 space-y-1">
                {feature.screenSteps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-tide-600 font-bold">{i + 1}.</span>{s}
                  </li>
                ))}
              </ol>
            </Field>
            <Field label="B-roll searches"><Chips items={feature.brollTerms} /></Field>
            <Field label="Hashtags"><Chips items={feature.suggestedHashtags} /></Field>
          </div>
        </div>

        <div className="mt-4">
          <SaveButton
            pending={pending}
            saved={!!savedId}
            onClick={() => save({ kind: "feature-demo", platform: "multi", sourceRefs: { feature: feature.key }, ...draft })}
          />
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------- captions -------------------------------- */

function CaptionsTab({ aiConfigured }: { aiConfigured: boolean }) {
  const [topic, setTopic] = useState("");
  const [pending, start] = useTransition();
  const [caps, setCaps] = useState<GeneratedCaptions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { save, pending: saving, savedId } = useSaver();

  function generate() {
    setError(null);
    start(async () => {
      const res = await runGenerateCaptions({ topic });
      if (res.ok) setCaps(res.data);
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-5">
      {!aiConfigured && <AiOffNotice />}
      <Card className="p-5">
        <Label htmlFor="topic">What's the video about?</Label>
        <Textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. quick clip showing how to tie a uni-to-uni braid to leader connection for inshore trout"
        />
        <div className="mt-3">
          <Button type="button" onClick={generate} disabled={pending || !aiConfigured}>
            <MessageSquareText className="size-4" />
            {pending ? "Writing…" : "Write captions"}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      </Card>

      {caps && (
        <Card className="p-5 space-y-4">
          {(["tiktok", "instagram", "youtube", "facebook"] as const).map((k) => (
            <div key={k}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{PLATFORM_LABELS[k]}</span>
                <CopyButton text={caps[k] ?? ""} />
              </div>
              <p className="text-sm text-ink-700 whitespace-pre-wrap rounded-xl bg-sand-50 border border-sand-200 p-3">{caps[k]}</p>
            </div>
          ))}
          <SaveButton
            pending={saving}
            saved={!!savedId}
            onClick={() => save({ kind: "caption", platform: "multi", title: topic.slice(0, 80) || "Caption set", captions: caps })}
          />
        </Card>
      )}
    </div>
  );
}

/* ---------------------------- comment assistant --------------------------- */

function CommentsTab({ aiConfigured }: { aiConfigured: boolean }) {
  const [ctx, setCtx] = useState("");
  const [pending, start] = useTransition();
  const [comments, setComments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { save, pending: saving, savedId } = useSaver();

  function generate() {
    setError(null);
    start(async () => {
      const res = await runGenerateComments({ context: ctx, count: 6 });
      if (res.ok) setComments(res.data);
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-5">
      <Card className="p-4 flex items-start gap-3 bg-tide-50 border-tide-200">
        <Info className="size-5 text-tide-600 shrink-0 mt-0.5" />
        <p className="text-sm text-ink-700">
          These are draft comment options for you to review and post yourself. Nothing here posts, likes, or replies automatically. Use them to sound like a real angler, not a bot.
        </p>
      </Card>
      {!aiConfigured && <AiOffNotice />}
      <Card className="p-5">
        <Label htmlFor="cctx">Describe the post you're commenting on</Label>
        <Textarea
          id="cctx"
          value={ctx}
          onChange={(e) => setCtx(e.target.value)}
          placeholder="e.g. someone posted a solid slot redfish caught at first light on a gold spoon"
        />
        <div className="mt-3">
          <Button type="button" onClick={generate} disabled={pending || !aiConfigured}>
            <MessagesSquare className="size-4" />
            {pending ? "Thinking…" : "Suggest comments"}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      </Card>

      {comments.length > 0 && (
        <Card className="p-5 space-y-2.5">
          {comments.map((c, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-sand-50 border border-sand-200 px-3.5 py-2.5">
              <p className="flex-1 text-sm text-ink-700">{c}</p>
              <CopyButton text={c} />
            </div>
          ))}
          <SaveButton
            pending={saving}
            saved={!!savedId}
            onClick={() => save({ kind: "comment-pack", title: `Comments: ${ctx.slice(0, 60) || "post"}`, comments })}
          />
        </Card>
      )}
    </div>
  );
}

/* ------------------------------- highlights ------------------------------- */

const HIGHLIGHT_TYPES = [
  "Catch of the Day",
  "Crew Spotlight",
  "What's Biting This Week",
  "Best Gear Setup",
  "Fish Guide Feature",
];

function catchLabel(c: CatchProp): string {
  const parts = [c.species ?? "Fish"];
  if (c.lengthIn) parts.push(`${c.lengthIn} in`);
  if (c.weightLb) parts.push(`${c.weightLb} lb`);
  if (c.method) parts.push(`by ${c.method}`);
  if (c.bait) parts.push(`on ${c.bait}`);
  return `${parts.join(", ")} — @${c.handle}`;
}

function HighlightsTab({ aiConfigured, catches }: { aiConfigured: boolean; catches: CatchProp[] }) {
  const [type, setType] = useState(HIGHLIGHT_TYPES[0]);
  const [subject, setSubject] = useState("");
  const [catchId, setCatchId] = useState<string>("");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<GeneratedHighlight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { save, pending: saving, savedId } = useSaver();

  function generate() {
    setError(null);
    const chosen = catches.find((c) => c.id === catchId);
    const subj = chosen ? catchLabel(chosen) : subject;
    start(async () => {
      const res = await runGenerateHighlight({ highlightType: type, subject: subj });
      if (res.ok) setResult(res.data);
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-5">
      <Card className="p-4 flex items-start gap-3 bg-tide-50 border-tide-200">
        <Info className="size-5 text-tide-600 shrink-0 mt-0.5" />
        <p className="text-sm text-ink-700">
          Only public catches from anglers who turned on <strong>social featuring</strong> in their settings show up here.
          {catches.length === 0 && " No one has opted in yet, so you can still write a highlight from a free-text subject below."}
        </p>
      </Card>
      {!aiConfigured && <AiOffNotice />}

      <Card className="p-5 space-y-3">
        <div>
          <Label htmlFor="htype">Highlight type</Label>
          <Select id="htype" value={type} onChange={(e) => setType(e.target.value)}>
            {HIGHLIGHT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        {catches.length > 0 && (
          <div>
            <Label htmlFor="hcatch">Feature a catch (opted-in only)</Label>
            <Select id="hcatch" value={catchId} onChange={(e) => setCatchId(e.target.value)}>
              <option value="">None / use free text</option>
              {catches.map((c) => <option key={c.id} value={c.id}>{catchLabel(c)}</option>)}
            </Select>
          </div>
        )}
        {!catchId && (
          <div>
            <Label htmlFor="hsubject">Subject</Label>
            <Textarea
              id="hsubject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. spotlight the Lowcountry Wade Crew, or feature the new flounder guide"
            />
          </div>
        )}
        <Button type="button" onClick={generate} disabled={pending || !aiConfigured}>
          <Star className="size-4" />
          {pending ? "Building…" : "Build highlight"}
        </Button>
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      </Card>

      {result && (
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display font-bold text-ink-900">{result.title}</h3>
            <CopyButton text={buildExportText(result)} label="Copy package" />
          </div>
          <div className="mt-4 grid gap-4">
            <Field label="Script"><p className="text-sm text-ink-700 whitespace-pre-wrap">{result.script}</p></Field>
            <Field label="Overlays"><Chips items={result.overlays} /></Field>
            <Field label="Caption"><p className="text-sm text-ink-700 whitespace-pre-wrap">{result.caption}</p></Field>
            <Field label="Hashtags"><Chips items={result.hashtags} /></Field>
          </div>
          <div className="mt-4">
            <SaveButton
              pending={saving}
              saved={!!savedId}
              onClick={() =>
                save({
                  kind: "highlight",
                  platform: "multi",
                  title: result.title,
                  script30: result.script,
                  overlays: result.overlays,
                  caption: result.caption,
                  hashtags: result.hashtags,
                  sourceRefs: catchId ? { catchId } : { highlightType: type },
                })
              }
            />
          </div>
        </Card>
      )}
    </div>
  );
}

/* -------------------------------- templates ------------------------------- */

function TemplatesTab({
  templates,
  onUseForIdeas,
}: {
  templates: TemplateProp[];
  onUseForIdeas: (t: TemplateProp) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {templates.map((t) => (
        <Card key={t.slug} className="p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
              <LayoutTemplate className="size-4 text-tide-600" /> {t.name}
            </h3>
            <Badge variant="neutral">{t.lengthHint}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">{t.description}</p>
          <div className="mt-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500 mb-1">Structure</div>
            <ol className="text-sm text-ink-700 space-y-0.5">
              {t.beats.map((b, i) => (
                <li key={i} className="flex gap-2"><span className="text-tide-600 font-bold">{i + 1}.</span>{b}</li>
              ))}
            </ol>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-1.5 text-xs text-ink-500"><Hash className="size-3.5 mt-0.5 shrink-0" /><span>{t.suggestedHashtags.join(" ")}</span></div>
            <div className="flex items-start gap-1.5 text-xs text-ink-500"><ListChecks className="size-3.5 mt-0.5 shrink-0" /><span>{t.brollTerms.join(", ")}</span></div>
          </div>
          <div className="mt-4 pt-3 border-t border-sand-100 flex gap-2">
            <Button type="button" size="sm" onClick={() => onUseForIdeas(t)}>
              <Sparkles className="size-4" /> Generate ideas
            </Button>
            <CopyButton
              text={buildExportText({
                title: t.name,
                hook: t.defaultHook,
                cta: t.defaultCta,
                overlays: t.beats,
                brollTerms: t.brollTerms,
                hashtags: t.suggestedHashtags,
              })}
              label="Copy template"
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
