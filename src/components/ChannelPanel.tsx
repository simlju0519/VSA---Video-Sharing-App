"use client";

import { useState } from "react";
import { Channel } from "@/lib/types";
import Spinner from "./Spinner";

interface Props {
  channels: Channel[];
  loading: boolean;
  onLaunch: (channel: Channel) => void;
  onAddChannel: (name: string, streamUrl: string, category: string) => void;
  onDeleteChannel: (id: string) => void;
}

export default function ChannelPanel({ channels, loading, onLaunch, onAddChannel, onDeleteChannel }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [category, setCategory] = useState("");
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const handleLaunch = (ch: Channel) => {
    setLaunchingId(ch.id);
    onLaunch(ch);
    setTimeout(() => setLaunchingId(null), 1500);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddChannel(name, streamUrl, category || "Other");
    setName("");
    setStreamUrl("");
    setCategory("");
    setShowAdd(false);
  };

  const categories = [...new Set(channels.map((c) => c.category))];

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800/50 overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-neutral-100 dark:border-neutral-700/50 flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Channels</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 transition"
        >
          {showAdd ? "Cancel" : "+ Add Channel"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-3 sm:p-4 border-b border-neutral-100 dark:border-neutral-700/50 flex flex-col gap-2">
          <input
            className="w-full px-3 py-2 rounded-md text-sm border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            placeholder="Channel name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full px-3 py-2 rounded-md text-sm border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            placeholder="Stream URL (e.g. https://www.tv4play.se/kategorier/shl)"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            required
          />
          <input
            className="w-full px-3 py-2 rounded-md text-sm border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            placeholder="Category (e.g. Sports)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-40"
          >
            Add Channel
          </button>
        </form>
      )}

      <div className="p-3 sm:p-4">
        {channels.length === 0 ? (
          <p className="text-neutral-400 text-sm text-center py-4">No channels added yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {categories.map((cat) => (
              <div key={cat}>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-2">{cat}</p>
                <div className="flex flex-col gap-1.5">
                  {channels.filter((c) => c.category === cat).map((ch) => (
                    <div
                      key={ch.id}
                      className="group flex items-center justify-between p-3 rounded-md border border-neutral-100 dark:border-neutral-700/50 hover:border-neutral-200 dark:hover:border-neutral-600 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{ch.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{ch.streamUrl}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={() => handleLaunch(ch)}
                          disabled={loading}
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition disabled:opacity-40 flex items-center gap-1.5"
                        >
                          {launchingId === ch.id ? <Spinner /> : "▶ Watch Together"}
                        </button>
                        <button
                          onClick={() => onDeleteChannel(ch.id)}
                          className="px-2 py-1.5 rounded-md text-sm text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
