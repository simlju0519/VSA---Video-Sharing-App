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

  const createMeeting = async (subject: string, startDateTime: string, endDateTime: string) => {
    setLoading(true);
    await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, startDateTime, endDateTime }),
    });
    setLoading(false);
    fetchMeetings();
  };

  const handleQuickMeeting = (minutes: number) => {
    const start = new Date();
    const end = new Date(start.getTime() + minutes * 60000);
    createMeeting(`Quick ${minutes}min Session`, start.toISOString(), end.toISOString());
  };

  const deleteMeeting = async (id: string) => {
    await fetch(`/api/meetings/${id}`, { method: "DELETE" });
    fetchMeetings();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="animate-pulse text-neutral-400 text-sm"><Spinner className="w-6 h-6 mx-auto" /></div>
      </div>
    );
  }

  if (!session) return <LoginScreen onSignIn={() => signIn("azure-ad")} />;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header userName={session.user?.name} onSignOut={() => signOut()} />

      <div className="max-w-3xl mx-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
        <CreateMeetingPanel
          loading={loading}
          onQuickMeeting={handleQuickMeeting}
          onCustomMeeting={createMeeting}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Active Meetings
            </h2>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">{meetings.length} meeting{meetings.length !== 1 ? "s" : ""}</span>
          </div>
          <MeetingList meetings={meetings} onJoin={setJoinMeeting} onDelete={deleteMeeting} />
        </div>
      </div>

      {joinMeeting && <JoinModal meeting={joinMeeting} onClose={() => setJoinMeeting(null)} />}
    </div>
  );
}
