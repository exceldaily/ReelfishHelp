"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Flag } from "lucide-react";
import { sendMessage, markConversationRead } from "@/lib/actions/message-actions";
import { reportContent } from "@/lib/actions/catch-actions";
import { REPORT_REASONS } from "@/lib/constants";

type Msg = { id: string; body: string; senderId: string; createdAt: string };

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
  otherUserId,
  otherName,
}: {
  conversationId: string;
  initialMessages: Msg[];
  currentUserId: string;
  otherUserId: string;
  otherName: string;
}) {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>(initialMessages);
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  useEffect(() => {
    markConversationRead(conversationId).catch(() => {});
  }, [conversationId]);

  function submit() {
    const text = body.trim();
    if (!text) return;
    setBody("");
    // optimistic
    const optimistic: Msg = {
      id: `tmp-${Date.now()}`,
      body: text,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
    };
    setMsgs((m) => [...m, optimistic]);
    start(async () => {
      const res = await sendMessage(conversationId, text);
      if ("error" in res && res.error) {
        setMsgs((m) => m.filter((x) => x.id !== optimistic.id));
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-13rem)] sm:h-[calc(100dvh-11rem)]">
      <div className="flex-1 overflow-y-auto space-y-2.5 py-2 px-0.5">
        {msgs.length === 0 && (
          <p className="text-center text-sm text-ink-400 py-8">
            No messages yet. Say hi to {otherName}.
          </p>
        )}
        {msgs.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  mine
                    ? "bg-tide-700 text-white rounded-br-md"
                    : "bg-sand-100 text-ink-900 rounded-bl-md"
                }`}
              >
                <span className="whitespace-pre-wrap break-words">{m.body}</span>
                <span className={`block text-[10px] mt-0.5 ${mine ? "text-tide-200" : "text-ink-300"}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="pt-2 border-t border-sand-200">
        <div className="flex items-end gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={`Message ${otherName}…`}
            className="flex-1 resize-none rounded-xl border border-sand-300 px-3.5 py-2.5 text-[15px] min-h-11 max-h-32"
          />
          <button
            onClick={submit}
            disabled={pending || !body.trim()}
            className="rounded-xl bg-tide-900 text-white px-4 min-h-11 hover:bg-tide-800 disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="size-4" />
          </button>
        </div>
        <div className="mt-1.5 relative">
          {reported ? (
            <span className="text-xs text-ink-400">Report received — thank you.</span>
          ) : (
            <button
              onClick={() => setReporting((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-red-600"
            >
              <Flag className="size-3" /> Report this conversation
            </button>
          )}
          {reporting && (
            <div className="absolute bottom-full mb-1 left-0 w-64 bg-white rounded-xl shadow-lift border border-sand-200 py-1.5 z-20">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setReporting(false);
                    setReported(true);
                    reportContent({ targetType: "message", targetId: conversationId, reason: r, details: `Conversation with user ${otherUserId}` }).catch(() => {});
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
    </div>
  );
}
