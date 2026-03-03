"use client";

import { useState } from "react";
import Spinner from "./Spinner";

/* ── League config ── */
interface LeagueConfig {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  provider: "tv4" | "viaplay";
  /** tv4: page id, viaplay: content path */
  param: string;
}

const LEAGUES: LeagueConfig[] = [
  { id: "shl", name: "SHL", subtitle: "Svenska Hockeyligan", emoji: "🏒", provider: "tv4", param: "shl" },
  { id: "chl", name: "CHL", subtitle: "Champions Hockey League", emoji: "🏆", provider: "viaplay", param: "sport/ishockey/champions-hockey-league" },
];

/* ── Shared event type ── */
interface BrowseEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  streamUrl: string;
  imageUrl?: string | null;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  readableTime?: string;
  arena?: string;
  studio?: boolean;
  live?: boolean;
}

interface Props {
  onWatchTogether: (title: string, streamUrl: string, homeTeamLogo?: string, awayTeamLogo?: string) => Promise<string | null>;
  onSchedule: (title: string, streamUrl: string, startTime: string, endTime: string, homeTeamLogo?: string, awayTeamLogo?: string) => void;
}

function isLive(e: BrowseEvent) {
  const now = Date.now();
  return new Date(e.startTime).getTime() <= now && new Date(e.endTime).getTime() > now;
}

function isToday(e: BrowseEvent) {
  const d = new Date(e.startTime);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

async function fetchTV4(param: string): Promise<BrowseEvent[]> {
  const res = await fetch(`/api/tv4?page=${param}`);
  const data = await res.json();
  return (data.panels || []).flatMap((p: { events: TV4Event[] }) =>
    p.events.map((e: TV4Event): BrowseEvent => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      streamUrl: `https://www.tv4play.se/program/${e.id}/${e.slug}`,
      homeTeamLogo: e.homeTeamLogo,
      awayTeamLogo: e.awayTeamLogo,
      readableTime: e.readableTime,
      arena: e.arena,
      studio: e.studio,
    }))
  );
}

type TV4Event = { id: string; title: string; slug: string; startTime: string; endTime: string; homeTeamLogo: string | null; awayTeamLogo: string | null; readableTime: string; arena: string; studio: boolean };

async function fetchViaplay(param: string): Promise<BrowseEvent[]> {
  const res = await fetch(`/api/viaplay?path=${encodeURIComponent(param)}`);
  const data = await res.json();
  return (data.events || []).map((e: ViaplayEvent): BrowseEvent => ({
    id: e.id,
    title: e.title,
    startTime: e.startTime,
    endTime: e.endTime,
    streamUrl: e.streamUrl,
    imageUrl: e.imageUrl,
    readableTime: new Date(e.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));
}

type ViaplayEvent = { id: string; title: string; startTime: string; endTime: string; streamUrl: string; imageUrl: string | null };

const FETCHERS: Record<string, (param: string) => Promise<BrowseEvent[]>> = {
  tv4: fetchTV4,
  viaplay: fetchViaplay,
};

export default function BrowsePanel({ onWatchTogether, onSchedule }: Props) {
  const [step, setStep] = useState<"closed" | "leagues" | "matches">("closed");
  const [activeLeague, setActiveLeague] = useState<LeagueConfig | null>(null);
  const [matches, setMatches] = useState<BrowseEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [pendingEvent, setPendingEvent] = useState<BrowseEvent | null>(null);

  const loadLeague = async (league: LeagueConfig) => {
    setActiveLeague(league);
    setStep("matches");
    setLoading(true);
    try {
      const all = await FETCHERS[league.provider](league.param);
      setMatches(all.filter((e) => isToday(e) || isLive(e)));
    } finally {
      setLoading(false);
    }
  };

  const handlePick = async (e: BrowseEvent) => {
    if (isLive(e)) {
      setLaunchingId(e.id);
      const joinUrl = await onWatchTogether(e.title, e.streamUrl, e.homeTeamLogo || undefined, e.awayTeamLogo || undefined);
      if (joinUrl) {
        window.open(joinUrl, "_blank");
        window.location.href = e.streamUrl;
      }
      setTimeout(() => setLaunchingId(null), 1500);
    } else {
      setPendingEvent(e);
    }
  };

  const handleSchedule = (e: BrowseEvent) => {
    onSchedule(e.title, e.streamUrl, e.startTime, e.endTime, e.homeTeamLogo || undefined, e.awayTeamLogo || undefined);
    setPendingEvent(null);
  };

  const handleStartNow = async (e: BrowseEvent) => {
    setLaunchingId(e.id);
    const joinUrl = await onWatchTogether(e.title, e.streamUrl, e.homeTeamLogo || undefined, e.awayTeamLogo || undefined);
    if (joinUrl) {
      window.open(joinUrl, "_blank");
      window.location.href = e.streamUrl;
    }
    setPendingEvent(null);
    setTimeout(() => setLaunchingId(null), 1500);
  };

  const close = () => { setStep("closed"); setMatches([]); setPendingEvent(null); setActiveLeague(null); };

  if (step === "closed") {
    return (
      <button onClick={() => setStep("leagues")} className="w-full py-4 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400 transition text-sm font-medium">
        📺 Start Watch Together
      </button>
    );
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800/50 overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-neutral-100 dark:border-neutral-700/50 flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">📺 Watch Together</h2>
        <button onClick={close} className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition">✕ Close</button>
      </div>

      <div className="p-3 sm:p-4">
        {step === "matches" && !pendingEvent && (
          <button onClick={() => { setStep("leagues"); setMatches([]); setActiveLeague(null); }} className="text-xs text-blue-500 hover:text-blue-400 mb-3 block">← Back</button>
        )}

        {/* Not-live modal */}
        {pendingEvent && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">⏳ This match hasn&apos;t started yet</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
              <span className="font-medium">{pendingEvent.title}</span> starts at{" "}
              {new Date(pendingEvent.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <div className="flex gap-2">
              <button onClick={() => handleSchedule(pendingEvent)} className="flex-1 py-2 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition">📅 Plan Watch Party</button>
              <button onClick={() => handleStartNow(pendingEvent)} className="flex-1 py-2 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-500 transition">▶ Start Now Anyway</button>
              <button onClick={() => setPendingEvent(null)} className="px-3 py-2 rounded-md text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition">Cancel</button>
            </div>
          </div>
        )}

        {/* League picker */}
        {step === "leagues" && !pendingEvent && (
          <div className="flex flex-col gap-2">
            {LEAGUES.map((l) => (
              <button key={l.id} onClick={() => loadLeague(l)} className="w-full flex items-center justify-between p-4 rounded-lg border border-neutral-100 dark:border-neutral-700/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{l.emoji}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{l.name}</p>
                    <p className="text-xs text-neutral-400">{l.subtitle}</p>
                  </div>
                </div>
                <span className="text-neutral-400">▸</span>
              </button>
            ))}
          </div>
        )}

        {/* Matches */}
        {step === "matches" && !pendingEvent && (
          <>
            {activeLeague && <p className="text-xs text-neutral-400 mb-2">{activeLeague.emoji} {activeLeague.name}</p>}
            {loading ? (
              <div className="flex justify-center py-8"><Spinner className="w-5 h-5" /></div>
            ) : matches.length === 0 ? (
              <p className="text-neutral-400 text-sm text-center py-4">No matches today.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {matches.map((e) => {
                  const live = isLive(e);
                  return (
                    <button key={e.id} onClick={() => handlePick(e)} disabled={launchingId === e.id} className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700/50 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition text-left disabled:opacity-40">
                      {e.homeTeamLogo && e.awayTeamLogo ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <img src={e.homeTeamLogo} alt="" className="w-8 h-8 object-contain" />
                          <span className="text-[10px] text-neutral-400 font-bold">vs</span>
                          <img src={e.awayTeamLogo} alt="" className="w-8 h-8 object-contain" />
                        </div>
                      ) : e.imageUrl ? (
                        <img src={e.imageUrl} alt="" className="w-16 h-9 rounded object-cover shrink-0" />
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {live && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />}
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{e.title}</p>
                        </div>
                        <p className="text-xs text-neutral-400 truncate">
                          {e.readableTime || new Date(e.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {e.arena ? ` · ${e.arena}` : ""}
                          {e.studio ? " · 📺 Studio" : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-green-600 dark:text-green-400">
                        {launchingId === e.id ? <Spinner /> : live ? "🔴 LIVE" : "▶ Watch"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
