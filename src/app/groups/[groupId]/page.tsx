"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getGroup, subscribeToExpenses, addExpense, deleteExpense, computeBalances } from "@/lib/firestore";
import { Group, Expense, Balance } from "@/types";

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [tab, setTab] = useState<"balances" | "expenses">("balances");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add expense form state
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGroup(groupId).then((g) => {
      setGroup(g);
      if (g && user) setPaidBy(user.uid);
      setLoading(false);
    });
  }, [groupId, user]);

  useEffect(() => {
    const unsub = subscribeToExpenses(groupId, (exps) => {
      setExpenses(exps);
      if (group) setBalances(computeBalances(exps, group.members));
    });
    return unsub;
  }, [groupId, group]);

  useEffect(() => {
    if (group) setBalances(computeBalances(expenses, group.members));
  }, [expenses, group]);

  const handleAddExpense = async () => {
    if (!user || !group || !desc.trim() || !amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    const total = parseFloat(amount);
    const split = total / group.members.length;
    await addExpense(groupId, {
      description: desc.trim(),
      amount: total,
      paidBy,
      splits: group.members.map((m) => ({ memberId: m.id, amount: split })),
      createdAt: Date.now(),
      createdBy: user.uid,
    });
    setDesc("");
    setAmount("");
    setShowAdd(false);
    setSaving(false);
  };

  const myMember = group?.members.find((m) => m.uid === user?.uid);
  const myBalance = balances.find((b) => b.memberId === myMember?.id);

  if (loading) return <LoadingScreen />;
  if (!group) return <div className="p-8 text-center text-gray-500">Group not found</div>;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-teal-700 text-white px-5 pt-14 pb-5 safe-top">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="text-teal-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="text-3xl">{group.emoji}</span>
          <div>
            <h1 className="text-xl font-bold leading-tight">{group.name}</h1>
            <p className="text-teal-200 text-sm">{group.members.length} members</p>
          </div>
        </div>

        {/* My balance pill */}
        {myBalance && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
            myBalance.net > 0 ? "bg-green-500/20 text-green-200" :
            myBalance.net < 0 ? "bg-red-500/20 text-red-200" :
            "bg-white/10 text-teal-200"
          }`}>
            {myBalance.net > 0 ? `You are owed ₹${myBalance.net.toFixed(0)}` :
             myBalance.net < 0 ? `You owe ₹${Math.abs(myBalance.net).toFixed(0)}` :
             "All settled up ✓"}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 sticky top-0 z-10">
        {(["balances", "expenses"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
              tab === t ? "text-teal-700 border-b-2 border-teal-700" : "text-gray-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {tab === "balances" ? (
          <div className="flex flex-col gap-3">
            {balances.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No expenses yet</p>
            ) : (
              balances.map((b) => (
                <div key={b.memberId} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                      {b.memberName[0].toUpperCase()}
                    </div>
                    <p className="font-medium text-gray-800">{b.memberName}</p>
                  </div>
                  <span className={`font-bold ${b.net > 0 ? "text-green-600" : b.net < 0 ? "text-red-500" : "text-gray-400"}`}>
                    {b.net === 0 ? "settled" : b.net > 0 ? `+₹${b.net.toFixed(0)}` : `-₹${Math.abs(b.net).toFixed(0)}`}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {expenses.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No expenses yet</p>
            ) : (
              expenses.map((e) => {
                const payer = group.members.find((m) => m.id === e.paidBy);
                const myShare = e.splits.find((s) => s.memberId === myMember?.id)?.amount || 0;
                const iPaid = e.paidBy === myMember?.id;
                return (
                  <div key={e.id} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{e.description}</p>
                        <p className="text-sm text-gray-400 mt-0.5">{payer?.name} paid · ₹{e.amount.toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${iPaid ? "text-green-600" : "text-red-500"}`}>
                          {iPaid ? `+₹${(e.amount - myShare).toFixed(0)}` : `-₹${myShare.toFixed(0)}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-8 right-5 w-14 h-14 bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Add expense sheet */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 safe-bottom">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Description (e.g. Dinner)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              autoFocus
            />
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Total amount (₹)"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="mb-5">
              <p className="text-sm text-gray-500 mb-2">Paid by</p>
              <div className="flex flex-wrap gap-2">
                {group.members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaidBy(m.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
                      paidBy === m.id ? "border-teal-600 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4 text-center">
              Split equally among all {group.members.length} members
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium">
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!desc.trim() || !amount || saving}
                className="flex-1 py-3 rounded-xl bg-teal-700 text-white font-semibold disabled:opacity-50"
              >
                {saving ? "Adding…" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen">
      <div className="bg-teal-700 h-36 safe-top" />
      <div className="px-4 py-4 flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm h-16 shimmer" />
        ))}
      </div>
    </div>
  );
}
