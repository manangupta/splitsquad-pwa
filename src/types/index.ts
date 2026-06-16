export type GroupType = "TRIP" | "HOME" | "OTHER" | "COUPLE" | "SPORTS" | "EVENT";

export interface Member {
  id: string;
  name: string;
  email?: string;
  uid?: string;
  photoUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  type: GroupType;
  members: Member[];
  createdBy: string;
  createdAt: number;
  totalExpenses?: number;
}

export interface Split {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splits: Split[];
  createdAt: number;
  createdBy: string;
  deleted?: boolean;
  category?: string;
}

export interface Balance {
  memberId: string;
  memberName: string;
  net: number; // positive = owed to you, negative = you owe
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
}
