"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useState } from "react";

export default function InstallBanner() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-teal-700 text-white px-4 py-3 flex items-center gap-3 shadow-lg">
      <span className="text-2xl">📱</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">Add SplitSquad to your home screen</p>
        <p className="text-xs text-teal-200 leading-tight">Works offline, feels native</p>
      </div>
      <button
        onClick={install}
        className="bg-white text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
      >
        Install
      </button>
      <button onClick={() => setDismissed(true)} className="text-teal-200 shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
