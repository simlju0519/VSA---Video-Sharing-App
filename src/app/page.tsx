"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { Meeting } from "@/lib/types";
import Spinner from "@/components/Spinner";
import Header from "@/components/Header";
import LoginScreen from "@/components/LoginScreen";
import CreateMeetingPanel from "@/components/CreateMeetingPanel";
import MeetingList from "@/components/MeetingList";
import JoinModal from "@/components/JoinModal";
import BrowsePanel from "@/components/BrowsePanel";

export default function Home() {
  const { data: session, status } = useSession();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [joinMeeting, setJoinMeeting] = useState<Meeting | null>(null);

  const fetchMeetings = useCallback(async () => {
    const res = await fetch("/api/meetings");
    if (res.ok) setMeetings(await res.json());
  }, []);

  useEffect(() => {
    if (session) fetchMeetings();
  }, [session, fetchMeetings]);

  const createMeeting = async (subject: string, startDateTime: string, endDateTime: string, streamUrl?: string, homeTeamLogo?: string, awayTeamLogo?: string): Promise<Meeting | null> => {
    setLoading(true);
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, startDateTime, endDateTime, streamUrl, homeTeamLogo, awayTeamLogo }),
    });
    setLoading(false);
    fetchMeetings();
    if (res.ok) return res.json();
    return null;
  };

  const handleQuickMeeting = (minutes: number) => {
    const start = new Date();
    const end = new Date(start.getTime() + minutes * 60000);
    createMeeting(`Quick ${minutes}min Session`, start.toISOString(), end.toISOString());
  };

  const handleWatchTogether = async (title: string, streamUrl: string, homeTeamLogo?: string, awayTeamLogo?: string) => {
    const start = new Date();
    const end = new Date(start.getTime() + 180 * 60000);
    const meeting = await createMeeting(`📺 ${title}`, start.toISOString(), end.toISOString(), streamUrl, homeTeamLogo, awayTeamLogo);
    if (meeting) {
      window.open(streamUrl, "_blank");
      window.open(meeting.joinUrl, "_blank");
    }
  };

  const handleSchedule = async (title: string, streamUrl: string, startTime: string, endTime: string, homeTeamLogo?: string, awayTeamLogo?: string) => {
    await createMeeting(`📺 ${title}`, startTime, endTime, streamUrl, homeTeamLogo, awayTeamLogo);
  };

  const handleStartWatching = (m: Meeting) => {
    if (m.streamUrl) window.open(m.streamUrl, "_blank");
    window.open(m.joinUrl, "_blank");
  };

  const deleteMeeting = async (id: string) => {
    await fetch(`/api/meetings/${id}`, { method: "DELETE" });
    fetchMeetings();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (!session) return <LoginScreen onSignIn={() => signIn("azure-ad")} />;

  const now = new Date();
  const upcoming = meetings.filter((m) => new Date(m.startDateTime) > now);
  const active = meetings.filter((m) => new Date(m.startDateTime) <= now);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header userName={session.user?.name} onSignOut={() => signOut()} />

      <div className="max-w-3xl mx-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
        <BrowsePanel onWatchTogether={handleWatchTogether} onSchedule={handleSchedule} />

        <CreateMeetingPanel
          loading={loading}
          onQuickMeeting={handleQuickMeeting}
          onCustomMeeting={(s, start, end) => createMeeting(s, start, end)}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Active Meetings</h2>
            <span className="text-xs text-neutral-400">{active.length} meeting{active.length !== 1 ? "s" : ""}</span>
          </div>
          <MeetingList meetings={active} onJoin={setJoinMeeting} onDelete={deleteMeeting} onStartWatching={handleStartWatching} />
        </div>

        {upcoming.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">📅 Upcoming Watch Parties</h2>
              <span className="text-xs text-neutral-400">{upcoming.length}</span>
            </div>
            <MeetingList meetings={upcoming} onJoin={setJoinMeeting} onDelete={deleteMeeting} onStartWatching={handleStartWatching} />
          </div>
        )}
      </div>

      {joinMeeting && <JoinModal meeting={joinMeeting} onClose={() => setJoinMeeting(null)} />}
    </div>
  );
}
