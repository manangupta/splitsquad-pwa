"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/groups" : "/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-700">
      <div className="flex flex-col items-center gap-3">
        <span className="text-6xl">🤝</span>
        <p className="text-white text-lg font-semibold">SplitSquad</p>
      </div>
    </div>
  );
}
