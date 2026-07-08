"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";

export function StorageCleanupButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/cron/media-cleanup", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Cleanup failed");
      setMsg(
        `Purged ${data.purgedDeleted} deleted, ${data.purgedFailed} failed, dropped ${data.droppedOriginals} originals.`
      );
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Cleanup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" size="sm" onClick={run} disabled={busy}>
        <Trash2 className="size-4" /> {busy ? "Running…" : "Run cleanup now"}
      </Button>
      {msg && <span className="text-sm text-ink-600">{msg}</span>}
    </div>
  );
}
