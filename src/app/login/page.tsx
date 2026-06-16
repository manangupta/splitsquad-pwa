"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/groups");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-700 to-teal-900">
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 gap-6">
        <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-sm">
          <span className="text-7xl">🤝</span>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">SplitSquad</h1>
          <p className="text-teal-200 mt-2 text-base">Split expenses with friends & groups</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {["✈️ Trips", "🏠 Home", "🍕 Meals", "💸 Settle up"].map((f) => (
            <span key={f} className="bg-white/10 text-white text-sm px-3 py-1 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-12 safe-bottom">
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Get started</h2>
          <p className="text-gray-500 text-sm text-center mb-6">Sign in to access your groups</p>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl py-4 font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
