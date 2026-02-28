"use client";

import { useState } from "react";
import Spinner from "./Spinner";

interface Props {
  loading: boolean;
  onQuickMeeting: (minutes: number) => void;
  onCustomMeeting: (subject: string, start: string, end: string) => void;
}

export default function CreateMeetingPanel({ loading, onQuickMeeting, onCustomMeeting }: Props) {
  const [subject, setSubject] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [activeQuick, setActiveQuick] = useState<number | null>(null);

  const handleQuick = (min: number) => {
    setActiveQuick(min);
    onQuickMeeting(min);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuick(null);
    onCustomMeeting(subject || "Video Sharing Session", startDateTime, endDateTime);
    setSubject("");
    setStartDateTime("");
    setEndDateTime("");
  };

  if (!loading && activeQuick !== null) setActiveQuick(null);

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800/50 overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-neutral-100 dark:border-neutral-700/50">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">Quick Start</h2>
        <div className="grid grid-cols-2 sm:flex gap-2">
          {[
            { min: 20, label: "20 min" },
            { min: 30, label: "30 min" },
            { min: 60, label: "1 hour" },
            { min: 120, label: "2 hours" },
          ].map(({ min, label }) => (
            <button
              key={min}
              onClick={() => handleQuick(min)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-md text-sm font-medium border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading && activeQuick === min ? <Spinner /> : label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowCustom(!showCustom)}
        className="w-full px-3 sm:px-4 py-3 text-left text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition flex justify-between items-center"
      >
        <span>Custom meeting</span>
        <span className="text-xs">{showCustom ? "▲" : "▼"}</span>
      </button>

      {showCustom && (
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 pt-0 flex flex-col gap-3">
          <input
            className="w-full px-3 py-2 rounded-md text-sm border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            placeholder="Meeting subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1 block">Start</label>
              <input className="w-full px-3 py-2 rounded-md text-sm border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1 block">End</label>
              <input className="w-full px-3 py-2 rounded-md text-sm border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} required />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading && activeQuick === null ? <><Spinner /> Creating...</> : "Create Meeting"}
          </button>
        </form>
      )}
    </div>
  );
}
