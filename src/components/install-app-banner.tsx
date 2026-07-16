"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Share, MoreVertical, X, Smartphone, PlusSquare } from "lucide-react";

/**
 * "Get the app" banner for phones. ReelFishHelp installs as a PWA, so this
 * teaches iPhone and Android users the add-to-home-screen move. On Android
 * Chrome we catch beforeinstallprompt and offer a real one-tap Install button.
 * Hides itself when already installed, and stays dismissed via localStorage.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "rfh-install-banner-dismissed";

export function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("android");
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // already running as an installed app?
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone || localStorage.getItem(DISMISS_KEY)) return;

    const ua = navigator.userAgent;
    setPlatform(/iPhone|iPad|iPod/i.test(ua) ? "ios" : "android");
    setVisible(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function nativeInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") dismiss();
  }

  if (!visible) return null;

  return (
    <div className="lg:hidden mb-6 rounded-2xl border border-tide-200 bg-tide-50 shadow-card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Image src="/icons/icon-192.png" alt="" width={44} height={44} className="size-11 rounded-xl shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink-900">Put ReelFishHelp on your home screen</p>
          <p className="text-xs text-ink-500">Free, no app store, works like a real app.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-xl bg-bait-500 px-3.5 py-2 min-h-10 text-sm font-bold text-white hover:bg-bait-600"
        >
          {open ? "Hide" : "Show me"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="grid size-10 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-tide-100"
        >
          <X className="size-4" />
        </button>
      </div>

      {open && (
        <div className="border-t border-tide-200 bg-white px-4 py-4">
          {installEvent ? (
            <div className="flex flex-col items-start gap-2.5">
              <p className="text-sm text-ink-700">One tap and it installs like a normal app:</p>
              <button
                type="button"
                onClick={nativeInstall}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-tide-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-tide-700"
              >
                <Smartphone className="size-4" /> Install ReelFishHelp
              </button>
            </div>
          ) : platform === "ios" ? (
            <ol className="space-y-2.5 text-sm text-ink-700">
              <li className="flex items-start gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tide-100 text-xs font-bold text-tide-800">1</span>
                <span>Open this site in <strong>Safari</strong>, then tap the <strong>Share</strong> button <Share className="inline size-4 align-text-bottom text-tide-700" /> at the bottom.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tide-100 text-xs font-bold text-tide-800">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="inline size-4 align-text-bottom text-tide-700" />.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tide-100 text-xs font-bold text-tide-800">3</span>
                <span>Tap <strong>Add</strong>. The RFH icon lands on your home screen, ready to fish.</span>
              </li>
            </ol>
          ) : (
            <ol className="space-y-2.5 text-sm text-ink-700">
              <li className="flex items-start gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tide-100 text-xs font-bold text-tide-800">1</span>
                <span>Open this site in <strong>Chrome</strong>, then tap the <strong>menu</strong> <MoreVertical className="inline size-4 align-text-bottom text-tide-700" /> in the top corner.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tide-100 text-xs font-bold text-tide-800">2</span>
                <span>Tap <strong>Add to Home screen</strong> (some phones say <strong>Install app</strong>).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tide-100 text-xs font-bold text-tide-800">3</span>
                <span>Confirm, and the RFH icon lands on your home screen, ready to fish.</span>
              </li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
