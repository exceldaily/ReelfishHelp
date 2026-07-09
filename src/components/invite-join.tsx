"use client";

import { useActionState } from "react";
import { joinByInvite, type CrewFormResult } from "@/lib/actions/crew-actions";
import { Button, FieldError, Input } from "@/components/ui";

export function InviteJoin({ defaultCode = "" }: { defaultCode?: string }) {
  const [state, action, pending] = useActionState<CrewFormResult, FormData>(joinByInvite, undefined);

  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <Input name="code" defaultValue={defaultCode} placeholder="Enter invite code" aria-label="Invite code" />
        <FieldError>{state?.error}</FieldError>
      </div>
      <Button type="submit" variant="outline" disabled={pending}>{pending ? "Joining…" : "Join crew"}</Button>
    </form>
  );
}
