"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToGroups } from "@/lib/firestore";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BottomNav from "@/components/BottomNav";
import { Group } from "@/types";

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  createdAt: number;
  groupName: string;
  groupEmoji: string;
}

export default function ActivityPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubs: (() => void)[] = [];

    const groupUnsub = subscribeToGroups(user.uid, (groups) => {
      // Unsubscribe previous expense listeners
      unsubs.slice(1).forEach((u) => u());

      const allLogs: ActivityLog[] = [];
      let pending = groups.length;

      if (groups.length === 0) {
        setLogs([]);
        setLoading(false);
        return;
      }

      groups.forEach((group) => {
        const q = query(
          collection(db, "groups", group.id, "expenses"),
          orderBy("createdAt", "desc")
        );
        const unsub = onSnapshot(q, (snap) => {
          snap.forEach((d) => {
            const data = d.data();
            if (!data.deleted) {
              allLogs.push({
                id: d.id,
                type: "expense",
                description: data.description,
                createdAt: data.createdAt,
                groupName: group.name,
                groupEmoji: group.emoji,
              });
            }
          });
          pending--;
          if (pending === 0) {
            allLogs.sort((a, b) => b.createdAt - a.createdAt);
            setLogs([...allLogs]);
            setLoading(false);
          }
        });
        unsubs.push(unsub);
      });
    });

    unsubs.push(groupUnsub);
    return () => unsubs.forEach((u) => u());
  }, [user]);

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-teal-700 text-white px-5 pt-14 pb-6 safe-top">
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-teal-200 text-sm">Recent expense history</p>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-16 shimmer" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">📋</span>
            <p className="text-gray-500 mt-3 font-medium">No activity yet</p>
            <p className="text-gray-400 text-sm mt-1">Add expenses to see them here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <div key={log.id + log.createdAt} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {log.groupEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{log.description}</p>
                  <p className="text-sm text-gray-400">{log.groupName}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
