import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { contextToPromptBlock, type StudioContext } from "./context";

const MODEL = "claude-opus-4-8";

export function contentStudioConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Shared voice rules. ReelFishHelp content sounds like a real angler, not a
 * brand account. Critically: NO em dashes or en dashes anywhere (owner
 * preference), and no fake hype.
 */
const VOICE = [
  "You write short-form fishing content for ReelFishHelp, a US recreational fishing app.",
  "Voice: casual, fishing-community, plain-spoken, like an experienced angler talking to friends.",
  "Never sound corporate or salesy. No fake hype, no clickbait lies, no exclamation spam.",
  "Hard rule: never use em dashes or en dashes. Use commas, periods, or start a new sentence instead.",
  "Keep it honest and useful. Real tips beat empty excitement.",
  "ReelFishHelp's core promise is location privacy: never encourage sharing exact fishing spots.",
].join(" ");

class NotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not configured, so AI generation is off. Add the key and redeploy.");
    this.name = "NotConfiguredError";
  }
}
export function isNotConfigured(e: unknown): boolean {
  return e instanceof NotConfiguredError || (e instanceof Error && e.name === "NotConfiguredError");
}

/* --------------------------------- ideas ---------------------------------- */

const ideaSchema = z.object({
  ideas: z
    .array(
      z.object({
        title: z.string().describe("Short internal title for the video idea"),
        platform: z
          .enum(["tiktok", "instagram", "youtube", "facebook", "multi"])
          .describe("Best-fit platform, or multi if it works everywhere"),
        hook: z.string().describe("The first line spoken/shown, 1 sentence, scroll-stopping but honest"),
        script15: z.string().describe("A tight ~15 second script"),
        script30: z.string().describe("A fuller ~30 second script"),
        overlays: z.array(z.string()).describe("3-5 short on-screen text overlays"),
        visuals: z.array(z.string()).describe("3-5 suggested visuals or shots"),
        cta: z.string().describe("One call-to-action line pointing to ReelFishHelp"),
        hashtags: z.array(z.string()).describe("6-10 relevant hashtags, lowercase, with #"),
        brollTerms: z.array(z.string()).describe("4-6 stock-footage search terms"),
      })
    )
    .describe("The generated video ideas"),
});
export type GeneratedIdea = z.infer<typeof ideaSchema>["ideas"][number];

export async function generateIdeas(input: {
  ctx: StudioContext;
  count: number;
  focus?: string;
}): Promise<GeneratedIdea[]> {
  if (!contentStudioConfigured()) throw new NotConfiguredError();
  const client = new Anthropic();
  const focusLine = input.focus?.trim()
    ? `Focus this batch on: ${input.focus.trim()}.`
    : "Vary the angle: mix species tips, gear, knots, what's biting, beginner help, and app features.";

  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    system:
      VOICE +
      "\n\nGenerate distinct short-form video ideas grounded in the app content below. " +
      "Prefer ideas that tie back to real ReelFishHelp species, setups, knots, or features. " +
      "Make each idea genuinely different from the others.",
    messages: [
      {
        role: "user",
        content: `App content to draw from:\n${contextToPromptBlock(input.ctx)}\n\n${focusLine}\nGenerate ${input.count} ideas.`,
      },
    ],
    output_config: { format: zodOutputFormat(ideaSchema) },
  });
  if (!res.parsed_output) throw new Error("Idea generation returned nothing. Try again.");
  return res.parsed_output.ideas;
}

/* -------------------------------- captions -------------------------------- */

const captionSchema = z.object({
  tiktok: z.string().describe("TikTok caption: short, punchy, a few hashtags inline"),
  instagram: z.string().describe("Instagram caption: slightly longer, hashtags grouped at the end"),
  youtube: z.string().describe("YouTube Shorts caption/description: 1-2 lines plus a couple tags"),
  facebook: z.string().describe("Facebook caption: friendly and conversational, minimal hashtags"),
});
export type GeneratedCaptions = z.infer<typeof captionSchema>;

export async function generateCaptions(input: {
  topic: string;
  ctx: StudioContext;
}): Promise<GeneratedCaptions> {
  if (!contentStudioConfigured()) throw new NotConfiguredError();
  const client = new Anthropic();
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 1500,
    system:
      VOICE +
      "\n\nWrite platform-native captions for the same video across four platforms. " +
      "Each should sound natural for that platform, not polished ad copy. Keep the angler voice.",
    messages: [
      {
        role: "user",
        content: `Season: ${input.ctx.season}. Video topic:\n${input.topic}\n\nWrite the four captions.`,
      },
    ],
    output_config: { format: zodOutputFormat(captionSchema) },
  });
  if (!res.parsed_output) throw new Error("Caption generation returned nothing. Try again.");
  return res.parsed_output;
}

/* -------------------------------- comments -------------------------------- */

const commentSchema = z.object({
  comments: z
    .array(z.string())
    .describe("Short, human-sounding comment suggestions an angler might leave"),
});

export async function generateComments(input: {
  context: string;
  count: number;
}): Promise<string[]> {
  if (!contentStudioConfigured()) throw new NotConfiguredError();
  const client = new Anthropic();
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 1200,
    system:
      VOICE +
      "\n\nWrite genuine, human comment suggestions for fishing posts. These are DRAFTS for a person to review and post manually. " +
      "They must never be spammy, never mass-generic, and never pushy about the app. " +
      "Most should just be real angler talk (asking what they threw, tide, etc). At most one may gently mention ReelFishHelp, and only if it fits naturally.",
    messages: [
      {
        role: "user",
        content: `Post context: ${input.context}\n\nWrite ${input.count} varied comment options.`,
      },
    ],
    output_config: { format: zodOutputFormat(commentSchema) },
  });
  if (!res.parsed_output) throw new Error("Comment generation returned nothing. Try again.");
  return res.parsed_output.comments;
}

/* ------------------------------- highlights ------------------------------- */

const highlightSchema = z.object({
  title: z.string().describe("Post title / on-screen headline"),
  script: z.string().describe("A short spoken or text script for the highlight"),
  overlays: z.array(z.string()).describe("2-4 on-screen text overlays"),
  caption: z.string().describe("A ready-to-post caption in the angler voice"),
  hashtags: z.array(z.string()).describe("6-10 hashtags, lowercase, with #"),
});
export type GeneratedHighlight = z.infer<typeof highlightSchema>;

export async function generateHighlight(input: {
  highlightType: string;
  subject: string;
  ctx: StudioContext;
}): Promise<GeneratedHighlight> {
  if (!contentStudioConfigured()) throw new NotConfiguredError();
  const client = new Anthropic();
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 1500,
    system:
      VOICE +
      "\n\nBuild a community highlight post. Celebrate the angler or content genuinely. " +
      "Never reveal or imply exact locations. Keep it warm and real.",
    messages: [
      {
        role: "user",
        content: `Highlight type: ${input.highlightType}. Season: ${input.ctx.season}.\nSubject:\n${input.subject}\n\nWrite the highlight.`,
      },
    ],
    output_config: { format: zodOutputFormat(highlightSchema) },
  });
  if (!res.parsed_output) throw new Error("Highlight generation returned nothing. Try again.");
  return res.parsed_output;
}
