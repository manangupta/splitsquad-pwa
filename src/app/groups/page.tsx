"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { subscribeToGroups, createGroup } from "@/lib/firestore";
import BottomNav from "@/components/BottomNav";
import { Group, GroupType } from "@/types";

const GROUP_EMOJIS: Record<GroupType, string> = {
  TRIP: "✈️", HOME: "🏠", OTHER: "🤝", COUPLE: "💑", SPORTS: "⚽", EVENT: "🎉",
};

export default function GroupsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<GroupType>("OTHER");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToGroups(user.uid, (g) => {
      setGroups(g);
      setGroupsLoading(false);
    });
    return unsub;
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    const emoji = GROUP_EMOJIS[newType];
    await createGroup(newName.trim(), emoji, newType, user.uid, {
      id: user.uid, name: user.name, email: user.email, uid: user.uid,
    });
    setNewName("");
    setNewType("OTHER");
    setShowCreate(false);
    setCreating(false);
  };

  const firstName = user?.name.split(" ")[0] ?? "";

  const totalOwed = groups.reduce((sum, g) => sum + (g.totalExpenses || 0), 0);

  if (loading || !user) return <SplashScreen />;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-teal-700 text-white px-5 pt-14 pb-6 safe-top">
        <p className="text-teal-200 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold">{firstName} 👋</h1>
      </div>

      <div className="px-4 -mt-4">
        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="text-gray-500 text-sm">Your groups</p>
          <p className="text-2xl font-bold text-gray-900">{groups.length} active</p>
        </div>

        {/* Groups list */}
        {groupsLoading ? (
          <SkeletonList />
        ) : groups.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">🤝</span>
            <p className="text-gray-500 mt-3 font-medium">No groups yet</p>
            <p className="text-gray-400 text-sm mt-1">Create one to start splitting expenses</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((g) => (
              <Link key={g.id} href={`/groups/${g.id}`}>
                <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {g.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{g.name}</p>
                    <p className="text-sm text-gray-400">{g.members.length} members</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Create group modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 safe-bottom">
            <h2 className="text-xl font-bold mb-4">New Group</h2>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Group name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div className="grid grid-cols-3 gap-2 mb-5">
              {(Object.entries(GROUP_EMOJIS) as [GroupType, string][]).map(([type, emoji]) => (
                <button
                  key={type}
                  onClick={() => setNewType(type)}
                  className={`flex flex-col items-center py-3 rounded-xl border-2 transition-colors ${
                    newType === type ? "border-teal-600 bg-teal-50" : "border-gray-100"
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs text-gray-600 mt-1 capitalize">{type.toLowerCase()}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="flex-1 py-3 rounded-xl bg-teal-700 text-white font-semibold disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl shimmer" />
          <div className="flex-1">
            <div className="h-4 w-32 rounded shimmer mb-2" />
            <div className="h-3 w-20 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-700">
      <div className="flex flex-col items-center gap-3">
        <span className="text-6xl">🤝</span>
        <p className="text-white text-lg font-semibold">SplitSquad</p>
      </div>
    </div>
  );
}
