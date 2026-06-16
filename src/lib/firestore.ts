import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  onSnapshot, query, orderBy, serverTimestamp, getDoc,
  where, Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { Group, Expense, Member } from "@/types";

// ── Groups ────────────────────────────────────────────────────────────────────

export function subscribeToGroups(uid: string, onChange: (groups: Group[]) => void): Unsubscribe {
  const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const groups: Group[] = [];
    snap.forEach((d) => {
      const data = d.data();
      const members: Member[] = data.members || [];
      if (members.some((m: Member) => m.uid === uid)) {
        groups.push({ id: d.id, ...data } as Group);
      }
    });
    onChange(groups);
  });
}

export async function createGroup(
  name: string,
  emoji: string,
  type: string,
  createdBy: string,
  selfMember: Member
): Promise<string> {
  const ref = await addDoc(collection(db, "groups"), {
    name,
    emoji,
    type,
    members: [selfMember],
    createdBy,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const snap = await getDoc(doc(db, "groups", groupId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Group) : null;
}

export async function updateGroupMembers(groupId: string, members: Member[]) {
  await updateDoc(doc(db, "groups", groupId), { members });
}

// ── Expenses ─────────────────────────────────────────────────────────────────

export function subscribeToExpenses(
  groupId: string,
  onChange: (expenses: Expense[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "groups", groupId, "expenses"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const expenses: Expense[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (!data.deleted) expenses.push({ id: d.id, ...data } as Expense);
    });
    onChange(expenses);
  });
}

export async function addExpense(groupId: string, expense: Omit<Expense, "id">) {
  await addDoc(collection(db, "groups", groupId, "expenses"), expense);
}

export async function deleteExpense(groupId: string, expenseId: string) {
  await updateDoc(doc(db, "groups", groupId, "expenses", expenseId), { deleted: true });
}

// ── Balances ──────────────────────────────────────────────────────────────────

export function computeBalances(expenses: Expense[], members: Member[]) {
  const net: Record<string, number> = {};
  members.forEach((m) => (net[m.id] = 0));

  expenses.forEach((e) => {
    net[e.paidBy] = (net[e.paidBy] || 0) + e.amount;
    e.splits.forEach((s) => {
      net[s.memberId] = (net[s.memberId] || 0) - s.amount;
    });
  });

  return members.map((m) => ({
    memberId: m.id,
    memberName: m.name,
    net: Math.round((net[m.id] || 0) * 100) / 100,
  }));
}

// ── Invite codes ──────────────────────────────────────────────────────────────

export async function getGroupByInviteCode(code: string): Promise<Group | null> {
  const q = query(collection(db, "groups"), where("inviteCode", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Group;
}

export async function joinGroup(groupId: string, member: Member) {
  const snap = await getDoc(doc(db, "groups", groupId));
  if (!snap.exists()) throw new Error("Group not found");
  const members: Member[] = snap.data().members || [];
  if (members.some((m) => m.uid === member.uid)) return;
  await updateDoc(doc(db, "groups", groupId), { members: [...members, member] });
}
