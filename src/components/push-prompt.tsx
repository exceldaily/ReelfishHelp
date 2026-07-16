"use client";

import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { savePushSubscription } from "@/lib/actions/push-actions";

/**
 * Registers the service worker on every load, and — when running as an
 * installed app (the moment push actually works on phones) — shows a one-time
 * card asking to turn on notifications. Granting subscribes this device so
 * bites, badges, likes, and messages buzz the phone.
 */

const DISMISS_KEY = "rfh-push-prompt-dismissed";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // always keep the SW registered so pushes are received
    navigator.serviceWorker.register("/sw.js").catch(() => {});

    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid || !("PushManager" in window) || !("Notification" in window)) return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (!standalone) return; // ask once they're in the installed app
    if (Notification.permission !== "default") return; // already decided
    if (localStorage.getItem(DISMISS_KEY)) return;
    setVisible(true);
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setVisible(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as BufferSource,
      });
      const json = sub.toJSON();
      await savePushSubscription({
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      });
      setDone(true);
      setTimeout(() => setVisible(false), 2500);
    } catch (e) {
      console.error("[push] subscribe failed:", e);
      setVisible(false);
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-6 rounded-2xl border border-tide-200 bg-tide-50 shadow-card p-4 flex items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-tide-100">
        <BellRing className="size-5 text-tide-700" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink-900">
          {done ? "You're set. Tight lines!" : "Want a heads up?"}
        </p>
        <p className="text-xs text-ink-500">
          {done
            ? "We'll buzz your phone when something bites."
            : "Get notified about likes, follows, badges, and messages."}
        </p>
      </div>
      {!done && (
        <>
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className="shrink-0 rounded-xl bg-bait-500 px-3.5 py-2 min-h-10 text-sm font-bold text-white hover:bg-bait-600 disabled:opacity-60"
          >
            {busy ? "One sec…" : "Turn on"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="grid size-10 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-tide-100"
          >
            <X className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
