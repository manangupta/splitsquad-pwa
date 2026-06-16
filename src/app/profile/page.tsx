"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Image from "next/image";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-teal-700 text-white px-5 pt-14 pb-8 safe-top flex flex-col items-center gap-3">
        {user.photoURL ? (
          <Image src={user.photoURL} alt={user.name} width={72} height={72} className="rounded-full border-2 border-white/30" />
        ) : (
          <div className="w-18 h-18 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {user.name[0]}
          </div>
        )}
        <div className="text-center">
          <p className="text-xl font-bold">{user.name}</p>
          <p className="text-teal-200 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <MenuItem icon="🔔" label="Notifications" />
          <MenuItem icon="🌙" label="Dark mode" />
          <MenuItem icon="🔒" label="Privacy" />
          <MenuItem icon="❓" label="Help & Support" />
          <MenuItem icon="⭐" label="Rate SplitSquad" />
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-white rounded-2xl shadow-sm py-4 text-red-500 font-semibold active:scale-[0.98] transition-transform"
        >
          Sign Out
        </button>

        <p className="text-center text-xs text-gray-400 mt-2">SplitSquad PWA · v1.0.0</p>
      </div>

      <BottomNav />
    </div>
  );
}

function MenuItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center px-4 py-3.5 gap-3 border-b border-gray-50 last:border-0 active:bg-gray-50">
      <span className="text-xl w-7">{icon}</span>
      <p className="flex-1 text-gray-800 font-medium">{label}</p>
      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
      </svg>
    </div>
  );
}
