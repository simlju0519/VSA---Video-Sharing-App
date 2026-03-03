"use client";

import { useState } from "react";
import { Meeting } from "@/lib/types";
import Spinner from "./Spinner";

interface Props {
  meetings: Meeting[];
  userEmail?: string;
  onJoin: (m: Meeting) => void;
  onDelete: (id: string) => void | Promise<void>;
  onStartWatching?: (m: Meeting) => void;
  onToggleWatch?: (id: string) => void | Promise<void>;
}

export default function MeetingList({ meetings, userEmail, onJoin, onDelete, onToggleWatch }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [watchingId, setWatchingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const handleWatch = async (id: string) => {
    if (!onToggleWatch) return;
    setWatchingId(id);
    await onToggleWatch(id);
    setWatchingId(null);
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
        const isWatching = userEmail ? m.watchers?.includes(userEmail) : false;

        return (
          <div key={m.id} className="group border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 sm:p-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition bg-white dark:bg-neutral-800/50">
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
                  {m.watchers?.length > 0 && <span className="ml-2">👀 {m.watchers.length}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleWatch(m.id)}
                  disabled={watchingId === m.id}
                  className={`px-3 py-2 sm:py-1.5 rounded-md text-sm transition ${isWatching ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" : "text-neutral-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"}`}
                  title={isWatching ? "Remove notification" : "Notify me when it starts"}
                >
                  {watchingId === m.id ? <Spinner /> : isWatching ? "🔔" : "🔕"}
                </button>
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
