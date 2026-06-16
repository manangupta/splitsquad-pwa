"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getGroupByInviteCode, joinGroup } from "@/lib/firestore";
import { Group } from "@/types";

export default function JoinGroupPage() {
  const { code } = useParams<{ code: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [state, setState] = useState<"loading" | "found" | "joining" | "joined" | "error">("loading");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=/join/${code}`);
      return;
    }
    getGroupByInviteCode(code).then((g) => {
      if (g) { setGroup(g); setState("found"); }
      else setState("error");
    });
  }, [code, user, authLoading, router]);

  const handleJoin = async () => {
    if (!user || !group) return;
    setState("joining");
    await joinGroup(group.id, { id: user.uid, name: user.name, email: user.email, uid: user.uid });
    setState("joined");
    setTimeout(() => router.replace(`/groups/${group.id}`), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-700 to-teal-900 flex flex-col items-center justify-center px-6 safe-top">
      {state === "loading" && (
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Looking up invite…</p>
        </div>
      )}

      {state === "found" && group && (
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
          <div className="text-6xl mb-4">{group.emoji}</div>
          <p className="text-gray-500 text-sm mb-1">You've been invited to join</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{group.name}</h1>
          <p className="text-gray-400 text-sm mb-6">{group.members.length} members already inside</p>
          <button
            onClick={handleJoin}
            className="w-full py-4 bg-teal-700 text-white font-bold rounded-2xl active:scale-95 transition-transform"
          >
            Join Group
          </button>
          <button onClick={() => router.replace("/groups")} className="mt-3 text-gray-400 text-sm w-full py-2">
            Not now
          </button>
        </div>
      )}

      {state === "joining" && (
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Joining…</p>
        </div>
      )}

      {state === "joined" && (
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-2xl font-bold">You're in!</p>
          <p className="text-teal-200 mt-2">Taking you to the group…</p>
        </div>
      )}

      {state === "error" && (
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invite not found</h2>
          <p className="text-gray-400 text-sm mb-6">This link may have expired or is invalid.</p>
          <button onClick={() => router.replace("/groups")} className="w-full py-4 bg-teal-700 text-white font-bold rounded-2xl">
            Go to Groups
          </button>
        </div>
      )}
    </div>
  );
}
