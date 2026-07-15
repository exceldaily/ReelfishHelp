"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Heart, MessageCircle, MessagesSquare, UserPlus, Award, CheckCircle2, Sparkles } from "lucide-react";
import { getNotifications, markNotificationsRead, type NotificationItem } from "@/lib/actions/notification-actions";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  follow: UserPlus,
  like: Heart,
  comment: MessageCircle,
  answer: MessagesSquare,
  accepted: CheckCircle2,
  badge: Award,
  welcome: Sparkles,
  system: Bell,
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/** Nav bell: unread count, dropdown with recent notifications, mark-read on open. */
export function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setUnread(initialUnread), [initialUnread]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function openPanel() {
    setOpen(true);
    start(async () => {
      const list = await getNotifications();
      setItems(list);
      if (list.some((n) => !n.read)) {
        await markNotificationsRead();
        router.refresh();
      }
      setUnread(0);
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        className="relative grid place-items-center size-10 rounded-full text-slate-200 hover:text-white hover:bg-neutral-900 transition-colors"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-bait-500 text-white text-[10px] font-bold grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl bg-white border border-sand-200 shadow-lift py-1.5 animate-fade-up">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink-500 border-b border-sand-100">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items === null ? (
              <p className="px-4 py-6 text-sm text-ink-500 text-center">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-500 text-center">
                Nothing yet. Log catches, join the forum, and earn badges — it all shows up here.
              </p>
            ) : (
              items.map((n) => {
                const Icon = TYPE_ICONS[n.type] ?? Bell;
                const inner = (
                  <span className="flex items-start gap-3">
                    {n.image ? (
                      <Image src={n.image} alt="" width={36} height={36} className="size-9 object-contain shrink-0 mt-0.5" />
                    ) : (
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tide-100 mt-0.5">
                        <Icon className="size-4 text-tide-700" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className={`block text-sm leading-snug ${n.read ? "text-ink-700" : "font-bold text-ink-900"}`}>
                        {n.title}
                      </span>
                      {n.body && <span className="block text-xs text-ink-500 leading-snug line-clamp-2">{n.body}</span>}
                      <span className="block text-[11px] text-ink-500 mt-0.5">{timeAgo(n.createdAt)}</span>
                    </span>
                  </span>
                );
                return n.href ? (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 hover:bg-sand-50 border-b border-sand-100 last:border-0"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id} className="px-4 py-2.5 border-b border-sand-100 last:border-0">
                    {inner}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
