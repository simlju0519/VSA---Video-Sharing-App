import { randomUUID, randomBytes } from "crypto";

export interface Meeting {
  id: string;
  subject: string;
  joinUrl: string;
  startDateTime: string;
  endDateTime: string;
  createdAt: string;
}

const meetings: Meeting[] = [];

export const meetingRepository = {
  create(subject: string, startTime: string, endTime: string): Meeting {
    const roomId = randomUUID() + randomBytes(16).toString("hex");
    const meeting: Meeting = {
      id: randomUUID(),
      subject,
      joinUrl: `${process.env.JITSI_BASE_URL || "https://meet.jit.si"}/vsa-${roomId}`,
      startDateTime: startTime,
      endDateTime: endTime,
      createdAt: new Date().toISOString(),
    };
    meetings.push(meeting);
    return meeting;
  },

  getById(id: string): Meeting | undefined {
    return meetings.find((m) => m.id === id);
  },

  listAll(): Meeting[] {
    return meetings;
  },

  delete(id: string): boolean {
    const idx = meetings.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    meetings.splice(idx, 1);
    return true;
  },
};
