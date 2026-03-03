"use client";

import Link from "next/link";

interface Props {
  userName?: string | null;
  onSignOut: () => void;
}

export default function Header({ userName, onSignOut }: Props) {
  return (
    <header className="flex justify-between items-center py-3 px-4 sm:py-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-lg sm:text-xl">📺</span>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight">Video Sharing</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 hidden sm:block">Share livestreams via video meetings</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 hidden sm:inline">{userName}</span>
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
            {userName?.[0]?.toUpperCase() || "?"}
          </div>
        </Link>
        <button
          onClick={onSignOut}
          className="text-xs text-neutral-400 hover:text-red-500 transition px-2 py-1.5 sm:px-3 rounded-md border border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-800"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
