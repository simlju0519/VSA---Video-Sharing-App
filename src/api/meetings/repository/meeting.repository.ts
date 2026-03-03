import { randomUUID, randomBytes } from "crypto";
import { query } from "@/lib/db";

export interface Meeting {
  id: string;
  subject: string;
  joinUrl: string;
  startDateTime: string;
  endDateTime: string;
  streamUrl?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  createdAt: string;
  watchers: string[];
  notified: boolean;
}

interface MeetingRow {
  id: string;
  subject: string;
  join_url: string;
  start_date_time: string;
  end_date_time: string;
  stream_url: string | null;
  home_team_logo: string | null;
  away_team_logo: string | null;
  created_at: string;
  watchers: string[];
  notified: boolean;
}

function toMeeting(r: MeetingRow): Meeting {
  return {
    id: r.id, subject: r.subject, joinUrl: r.join_url,
    startDateTime: r.start_date_time, endDateTime: r.end_date_time,
    streamUrl: r.stream_url || undefined, homeTeamLogo: r.home_team_logo || undefined,
    awayTeamLogo: r.away_team_logo || undefined, createdAt: r.created_at,
    watchers: r.watchers || [], notified: r.notified,
  };
}

export const meetingRepository = {
  async create(subject: string, startTime: string, endTime: string, streamUrl?: string, homeTeamLogo?: string, awayTeamLogo?: string): Promise<Meeting> {
    const id = randomUUID();
    const roomId = randomUUID() + randomBytes(16).toString("hex");
    const joinUrl = `${process.env.JITSI_BASE_URL || "https://meet.jit.si"}/vsa-${roomId}`;
    const createdAt = new Date().toISOString();
    const rows = await query<MeetingRow>(
      "INSERT INTO meetings (id, subject, join_url, start_date_time, end_date_time, stream_url, home_team_logo, away_team_logo, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [id, subject, joinUrl, startTime, endTime, streamUrl || null, homeTeamLogo || null, awayTeamLogo || null, createdAt]
    );
    return toMeeting(rows[0]);
  },

  async getById(id: string): Promise<Meeting | undefined> {
    const rows = await query<MeetingRow>("SELECT * FROM meetings WHERE id = $1", [id]);
    return rows[0] ? toMeeting(rows[0]) : undefined;
  },

  async listAll(): Promise<Meeting[]> {
    const rows = await query<MeetingRow>("SELECT * FROM meetings ORDER BY created_at DESC");
    return rows.map(toMeeting);
  },

  async delete(id: string): Promise<boolean> {
    const rows = await query<MeetingRow>("DELETE FROM meetings WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  },

  async toggleWatch(id: string, email: string): Promise<boolean> {
    // Remove if present, add if not
    const rows = await query<MeetingRow>("SELECT watchers FROM meetings WHERE id = $1", [id]);
    if (!rows[0]) return false;
    const has = (rows[0].watchers || []).includes(email);
    if (has) {
      await query("UPDATE meetings SET watchers = array_remove(watchers, $2) WHERE id = $1", [id, email]);
    } else {
      await query("UPDATE meetings SET watchers = array_append(watchers, $2) WHERE id = $1", [id, email]);
    }
    return true;
  },

  async setNotified(id: string): Promise<void> {
    await query("UPDATE meetings SET notified = TRUE WHERE id = $1", [id]);
  },

  async updateStartTime(id: string, startTime: string): Promise<void> {
    await query("UPDATE meetings SET start_date_time = $2 WHERE id = $1", [id, startTime]);
  },
};
