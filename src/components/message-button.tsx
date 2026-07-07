"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { startConversation } from "@/lib/actions/message-actions";

export function MessageButton({
  targetUserId,
  signedIn,
}: {
  targetUserId: string;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => {
        if (!signedIn) return router.push("/login");
        start(async () => {
          const res = await startConversation(targetUserId);
          if (res && "error" in res && res.error) alert(res.error);
        });
      }}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl border border-sand-300 bg-white px-4 py-2.5 min-h-11 text-sm font-bold text-ink-700 hover:bg-sand-100 transition-colors"
    >
      <MessageCircle className="size-4 text-tide-600" />
      Message
    </button>
  );
}
