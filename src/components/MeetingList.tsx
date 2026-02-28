"use client";

import { useState } from "react";
import { Meeting } from "@/lib/types";
import Spinner from "./Spinner";

interface Props {
  meetings: Meeting[];
  onJoin: (m: Meeting) => void;
  onDelete: (id: string) => void | Promise<void>;
  onStartWatching?: (m: Meeting) => void;
}

export default function MeetingList({ meetings, onJoin, onDelete, onStartWatching }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="text-4xl mb-3 opacity-40">📺</div>
        <p className="text-neutral-500 dark:text-neutral-400">No active meetings</p>
        <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1">Create one using Quick Start or Custom Meeting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {meetings.map((m) => {
        const start = new Date(m.startDateTime);
        const end = new Date(m.endDateTime);
        const now = new Date();
        const isLive = now >= start && now <= end;

        return (
          <div
            key={m.id}
            className="group border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 sm:p-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition bg-white dark:bg-neutral-800/50"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {m.homeTeamLogo && m.awayTeamLogo && (
                    <div className="flex items-center gap-1 shrink-0">
                      <img src={m.homeTeamLogo} alt="" className="w-6 h-6 object-contain" />
                      <span className="text-[9px] text-neutral-400 font-bold">vs</span>
                      <img src={m.awayTeamLogo} alt="" className="w-6 h-6 object-contain" />
                    </div>
                  )}
                  {isLive && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                  <h3 className="font-medium text-neutral-900 dark:text-white truncate">{m.subject}</h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {m.streamUrl && isLive && onStartWatching && (
                  <button
                    onClick={() => onStartWatching(m)}
                    className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition"
                  >
                    🔴 Start Watching
                  </button>
                )}
                <button
                  onClick={() => onJoin(m)}
                  className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition"
                >
                  Join
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="px-3 py-2 sm:py-1.5 rounded-md text-sm text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-40"
                >
                  {deletingId === m.id ? <Spinner /> : "✕"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
