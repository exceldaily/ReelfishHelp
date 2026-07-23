"use client";

import { useState, useTransition } from "react";
import { VerifiedTitleBadge } from "@/components/verified-badge";
import { useRouter } from "next/navigation";
import { Heart, Bookmark, Flag, Send, Trash2 } from "lucide-react";
import {
  toggleLike,
  toggleSavePost,
  addComment,
  deleteComment,
  reportContent,
} from "@/lib/actions/catch-actions";
import { REPORT_REASONS } from "@/lib/constants";

export function CatchSocialBar({
  catchId,
  initialLiked,
  initialSaved,
  likeCount,
  signedIn,
}: {
  catchId: string;
  initialLiked: boolean;
  initialSaved: boolean;
  likeCount: number;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(likeCount);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [, start] = useTransition();

  const requireLogin = () => {
    if (!signedIn) {
      router.push("/login");
      return true;
    }
    return false;
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        onClick={() => {
          if (requireLogin()) return;
          setLiked(!liked);
          setCount((c) => c + (liked ? -1 : 1));
          start(() => {
            toggleLike(catchId).catch(() => {});
          });
        }}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 min-h-11 text-sm font-bold transition-colors ${
          liked ? "bg-red-50 text-red-600 border border-red-200" : "border border-sand-300 bg-white text-ink-700 hover:bg-sand-100"
        }`}
      >
        <Heart className={`size-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
        {count}
      </button>
      <button
        onClick={() => {
          if (requireLogin()) return;
          setSaved(!saved);
          start(() => {
            toggleSavePost(catchId).catch(() => {});
          });
        }}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 min-h-11 text-sm font-bold transition-colors ${
          saved ? "bg-tide-100 text-tide-800" : "border border-sand-300 bg-white text-ink-700 hover:bg-sand-100"
        }`}
      >
        <Bookmark className={`size-4 ${saved ? "fill-tide-600 text-tide-600" : ""}`} />
        {saved ? "Saved" : "Save"}
      </button>
      <div className="ml-auto relative">
        {reported ? (
          <span className="text-xs font-semibold text-ink-500">Report received — thank you.</span>
        ) : (
          <button
            onClick={() => {
              if (requireLogin()) return;
              setReporting((v) => !v);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-300 hover:text-red-600 px-2 py-2"
          >
            <Flag className="size-3.5" /> Report
          </button>
        )}
        {reporting && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-lift border border-sand-200 py-1.5 z-20">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setReporting(false);
                  setReported(true);
                  start(() => {
                    reportContent({ targetType: "catch", targetId: catchId, reason: r }).catch(() => {});
                  });
                }}
                className="w-full text-left px-3.5 py-2 text-sm hover:bg-sand-100"
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({
  catchId,
  comments: initial,
  signedIn,
  currentUserId,
  catchOwnerId,
  isAdmin,
}: {
  catchId: string;
  comments: { id: string; body: string; createdAt: string; userId: string; author: string; username: string | null; verifiedTitle?: string | null }[];
  signedIn: boolean;
  currentUserId: string | null;
  catchOwnerId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    if (!signedIn) return router.push("/login");
    const text = body.trim();
    if (!text) return;
    setBody("");
    start(async () => {
      await addComment(catchId, text);
      router.refresh();
      setItems((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          body: text,
          createdAt: new Date().toISOString(),
          userId: currentUserId ?? "",
          author: "You",
          username: null,
        },
      ]);
    });
  }

  return (
    <div>
      <h3 className="font-display font-bold text-ink-900 mb-3">Comments ({items.length})</h3>
      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="rounded-xl bg-sand-100/60 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-900">{c.author} <VerifiedTitleBadge slug={c.verifiedTitle} compact /></span>
              <span className="text-xs text-ink-300">
                {new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                {(c.userId === currentUserId || catchOwnerId === currentUserId || isAdmin) && !c.id.startsWith("tmp-") && (
                  <button
                    onClick={() =>
                      start(async () => {
                        await deleteComment(c.id, catchId);
                        setItems((prev) => prev.filter((x) => x.id !== c.id));
                      })
                    }
                    className="ml-2 text-ink-300 hover:text-red-600"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="size-3.5 inline" />
                  </button>
                )}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-700 leading-relaxed">{c.body}</p>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-ink-500">No comments yet — be the first.</p>}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={signedIn ? "Add a comment…" : "Log in to comment"}
          className="flex-1 rounded-xl border border-sand-300 px-3.5 py-2.5 text-sm min-h-11"
        />
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-xl bg-tide-900 text-white px-4 min-h-11 hover:bg-tide-800 disabled:opacity-50"
          aria-label="Post comment"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
