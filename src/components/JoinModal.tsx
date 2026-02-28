"use client";

import { Meeting } from "@/lib/types";

interface Props {
  meeting: Meeting;
  onClose: () => void;
}

export default function JoinModal({ meeting, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-t-xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-md sm:mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{meeting.subject}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {new Date(meeting.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(meeting.endDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-lg">✕</button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={meeting.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-600 text-white py-3 sm:py-2.5 rounded-lg hover:bg-green-500 transition font-medium text-center text-sm"
          >
            Open Meeting ↗
          </a>
          <button onClick={onClose} className="py-3 sm:py-2.5 sm:px-5 rounded-lg text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-white transition border border-neutral-200 dark:border-neutral-700">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
