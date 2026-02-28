"use client";

interface Props {
  userName?: string | null;
  onSignOut: () => void;
}

export default function Header({ userName, onSignOut }: Props) {
  return (
    <header className="flex justify-between items-center py-4 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <span className="text-xl">📺</span>
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">Video Sharing</h1>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Share livestreams via video meetings</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{userName}</span>
        <button
          onClick={onSignOut}
          className="text-xs text-neutral-400 hover:text-red-500 transition px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-800"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
