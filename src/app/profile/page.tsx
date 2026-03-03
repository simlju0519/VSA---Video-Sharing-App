"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { Meeting } from "@/lib/types";
import Spinner from "@/components/Spinner";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const fetchMeetings = useCallback(async () => {
    const res = await fetch("/api/meetings");
    if (res.ok) setMeetings(await res.json());
  }, []);

  useEffect(() => {
    if (session) fetchMeetings();
  }, [session, fetchMeetings]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (!session) return null;

  const email = session.user?.email || "";
  const myWatchParties = meetings.filter((m) => m.watchers?.includes(email));
  const upcoming = myWatchParties.filter((m) => new Date(m.startDateTime) > new Date());

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="flex justify-between items-center py-3 px-4 sm:py-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <Link href="/" className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition">
          ← Back
        </Link>
        <button onClick={() => signOut()} className="text-xs text-neutral-400 hover:text-red-500 transition px-2 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-800">
          Sign out
        </button>
      </header>

      <div className="max-w-lg mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Profile info */}
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800/50 p-5 sm:p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
              {session.user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900 dark:text-white">{session.user?.name || "Unknown"}</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{email}</p>
            </div>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-700/50 pt-4 flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Provider</span>
              <span className="text-neutral-900 dark:text-white">Microsoft Azure AD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Notifications</span>
              <span className="text-neutral-900 dark:text-white">{myWatchParties.length} subscribed</span>
            </div>
          </div>
        </div>

        {/* My upcoming watch parties */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
            🔔 My Upcoming Watch Parties
          </h2>
          {upcoming.length === 0 ? (
            <div className="text-center py-8 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800/50">
              <p className="text-neutral-400 text-sm">No upcoming watch parties</p>
              <p className="text-neutral-400/60 text-xs mt-1">Pin a meeting with 🔔 to get notified</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcoming.map((m) => (
                <div key={m.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-neutral-800/50">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {m.homeTeamLogo && m.awayTeamLogo && (
                          <div className="flex items-center gap-1 shrink-0">
                            <img src={m.homeTeamLogo} alt="" className="w-5 h-5 object-contain" />
                            <span className="text-[8px] text-neutral-400 font-bold">vs</span>
                            <img src={m.awayTeamLogo} alt="" className="w-5 h-5 object-contain" />
                          </div>
                        )}
                        <h3 className="font-medium text-sm text-neutral-900 dark:text-white truncate">{m.subject}</h3>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {new Date(m.startDateTime).toLocaleDateString("sv-SE")}{" · "}{new Date(m.startDateTime).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })} – {new Date(m.endDateTime).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 shrink-0">🔔</span>
                  </div>
                  {m.watchers.length > 1 && (
                    <p className="text-xs text-neutral-400 mt-2">👀 {m.watchers.length} people watching</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
