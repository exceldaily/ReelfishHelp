"use client";

import { useActionState } from "react";
import { Send, Camera } from "lucide-react";
import { createCrewPost, type CrewFormResult } from "@/lib/actions/crew-actions";
import { Button, Card, FieldError, Select, Textarea } from "@/components/ui";
import { ImageInput } from "@/components/image-input";

export function CrewPostForm({
  crewId,
  catches,
}: {
  crewId: string;
  catches: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState<CrewFormResult, FormData>(createCrewPost, undefined);

  return (
    <Card className="p-4 sm:p-5">
      <form action={action} className="space-y-3">
        <input type="hidden" name="crewId" value={crewId} />
        <Textarea name="body" placeholder="Share an update with your crew…" maxLength={2000} />
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <span className="block text-xs font-semibold text-ink-500 mb-1">Attach a photo</span>
            <label className="flex items-center gap-2 rounded-xl border-2 border-dashed border-sand-300 hover:border-tide-400 px-3 py-2.5 cursor-pointer transition-colors">
              <Camera className="size-4 text-tide-600 shrink-0" />
              <ImageInput name="photo" className="text-sm" />
            </label>
          </div>
          {catches.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1">Share one of your public catches</label>
              <Select name="catchId" defaultValue="">
                <option value="">None</option>
                {catches.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
            </div>
          )}
        </div>
        <FieldError>{state?.error}</FieldError>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            <Send className="size-4" /> {pending ? "Posting…" : "Post"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
