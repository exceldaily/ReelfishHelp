"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteAccount, type DeleteAccountResult } from "@/lib/actions/account-actions";
import { Button, Card, Input, FieldError } from "@/components/ui";

/**
 * Danger zone: permanent account deletion with a type-to-confirm step.
 * Everything goes — profile, catches, photos, gear, spots, trips, forum
 * posts, messages, and any crews the user owns.
 */
export function AccountDeletion() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [state, action, pending] = useActionState<DeleteAccountResult, FormData>(deleteAccount, undefined);

  return (
    <Card className="p-5 border-red-200">
      <h2 className="font-display font-bold text-red-700 flex items-center gap-2">
        <AlertTriangle className="size-5" /> Delete account
      </h2>
      <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">
        Permanently deletes your account and everything on it: profile, catches, photos, gear locker,
        saved spots, trips, forum posts, and messages. If you own a crew, the crew goes too.
        There is no undo.
      </p>

      {!open ? (
        <Button type="button" variant="outline" size="sm" className="mt-4 border-red-300 text-red-700 hover:bg-red-50" onClick={() => setOpen(true)}>
          <Trash2 className="size-4" /> I want to delete my account
        </Button>
      ) : (
        <form action={action} className="mt-4 space-y-3">
          <label htmlFor="confirm" className="block text-sm font-semibold text-ink-700">
            Type <span className="font-mono font-bold text-red-700">DELETE</span> to confirm
          </label>
          <Input
            id="confirm"
            name="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            placeholder="DELETE"
            className="max-w-48"
          />
          <FieldError>{state?.error}</FieldError>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="danger" size="sm" disabled={pending || confirmText !== "DELETE"}>
              {pending ? "Deleting…" : "Permanently delete my account"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setOpen(false); setConfirmText(""); }}>
              Never mind
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
