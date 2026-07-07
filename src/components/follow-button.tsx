"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import { toggleFollow } from "@/lib/actions/follow-actions";

export function FollowButton({
  targetUserId,
  initialFollowing,
  signedIn,
}: {
  targetUserId: string;
  initialFollowing: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() => {
        if (!signedIn) return router.push("/login");
        setFollowing(!following);
        start(async () => {
          const res = await toggleFollow(targetUserId);
          if (typeof res.following === "boolean") setFollowing(res.following);
        });
      }}
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 min-h-11 text-sm font-bold transition-colors ${
        following
          ? "bg-tide-100 text-tide-800 hover:bg-tide-200"
          : "bg-bait-500 text-white hover:bg-bait-600"
      }`}
    >
      {following ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
