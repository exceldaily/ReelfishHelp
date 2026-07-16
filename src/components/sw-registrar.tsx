"use client";

import { useEffect } from "react";

/** Registers the push service worker on every page load (idempotent). */
export function SwRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
