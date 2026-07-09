"use client";

import { useActionState } from "react";
import { Button, Card, FieldError, Input, Label, Select, Textarea } from "@/components/ui";
import { ImageInput } from "@/components/image-input";
import type { CrewFormResult } from "@/lib/actions/crew-actions";

type CrewDefaults = {
  id: string;
  name: string;
  description: string | null;
  homeState: string | null;
  privacy: "open" | "private";
};

export function CrewForm({
  action,
  crew,
  submitLabel,
  states,
}: {
  action: (prev: CrewFormResult, formData: FormData) => Promise<CrewFormResult>;
  crew?: CrewDefaults;
  submitLabel: string;
  states: { code: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<CrewFormResult, FormData>(action, undefined);

  return (
    <Card className="p-5 sm:p-7">
      <form action={formAction} className="space-y-5">
        {crew && <input type="hidden" name="crewId" value={crew.id} />}
        <div>
          <Label htmlFor="name">Crew name</Label>
          <Input id="name" name="name" defaultValue={crew?.name ?? ""} placeholder="e.g. Tampa Bay Snook Squad" maxLength={80} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={crew?.description ?? ""} placeholder="What's this crew about? Who should join?" maxLength={1000} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="homeState">Home state (optional)</Label>
            <Select id="homeState" name="homeState" defaultValue={crew?.homeState ?? ""}>
              <option value="">No state</option>
              {states.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="privacy">Privacy</Label>
            <Select id="privacy" name="privacy" defaultValue={crew?.privacy ?? "open"}>
              <option value="open">Open — listed in the directory, anyone can join</option>
              <option value="private">Private — hidden, join by invite code only</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="avatar">Crew photo (optional)</Label>
          <ImageInput id="avatar" name="avatar" />
        </div>
        <FieldError>{state?.error}</FieldError>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
      </form>
    </Card>
  );
}
