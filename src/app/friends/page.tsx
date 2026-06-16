"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToGroups, computeBalances, subscribeToExpenses } from "@/lib/firestore";
import BottomNav from "@/components/BottomNav";
import { Group } from "@/types";

interface FriendBalance {
  uid: string;
  name: string;
  net: number; // positive = they owe you, negative = you owe them
  sharedGroups: string[];
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    return subscribeToGroups(user.uid, (groups) => {
      const map: Record<string, FriendBalance> = {};

      groups.forEach((group) => {
        const myMember = group.members.find((m) => m.uid === user.uid);
        if (!myMember) return;

        // Collect other members
        group.members.forEach((m) => {
          if (m.uid === user.uid || !m.uid) return;
          if (!map[m.uid]) {
            map[m.uid] = { uid: m.uid, name: m.name, net: 0, sharedGroups: [] };
          }
          map[m.uid].sharedGroups.push(group.name);
        });
      });

      setFriends(Object.values(map));
      setLoading(false);
    });
  }, [user]);

  const totalOwed = friends.filter((f) => f.net > 0).reduce((s, f) => s + f.net, 0);
  const totalOwe = friends.filter((f) => f.net < 0).reduce((s, f) => s + Math.abs(f.net), 0);

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-teal-700 text-white px-5 pt-14 pb-6 safe-top">
        <h1 className="text-2xl font-bold">Friends</h1>
        <p className="text-teal-200 text-sm">People you split with</p>
      </div>

      {friends.length > 0 && (
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-xs text-green-600 font-medium">You are owed</p>
            <p className="text-xl font-bold text-green-700 mt-1">₹{totalOwed.toFixed(0)}</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4">
            <p className="text-xs text-red-500 font-medium">You owe</p>
            <p className="text-xl font-bold text-red-600 mt-1">₹{totalOwe.toFixed(0)}</p>
          </div>
        </div>
      )}

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-16 shimmer" />
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">👥</span>
            <p className="text-gray-500 mt-3 font-medium">No friends yet</p>
            <p className="text-gray-400 text-sm mt-1">Add members to your groups to see them here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {friends.map((f) => (
              <div key={f.uid} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-lg shrink-0">
                  {f.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-400 truncate">{f.sharedGroups.join(", ")}</p>
                </div>
                <div className="text-right shrink-0">
                  {f.net === 0 ? (
                    <span className="text-sm text-gray-400">settled</span>
                  ) : f.net > 0 ? (
                    <span className="text-sm font-bold text-green-600">+₹{f.net.toFixed(0)}</span>
                  ) : (
                    <span className="text-sm font-bold text-red-500">-₹{Math.abs(f.net).toFixed(0)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
