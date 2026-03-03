import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { meetingService, CreateMeetingDto } from "../service/meeting.service";
import { meetingRepository } from "../repository/meeting.repository";
import { sendMeetingStarted } from "@/lib/mailer";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  return session;
}

export const meetingController = {
  async create(req: NextRequest) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      const body: CreateMeetingDto = await req.json();
      const meeting = await meetingService.create(body);
      return NextResponse.json(meeting, { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create meeting";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },

  async getById(id: string) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const meeting = await meetingService.getById(id);
    if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(meeting);
  },

  async listAll() {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await meetingService.listAll());
  },

  async delete(id: string) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await meetingService.delete(id);
    return NextResponse.json({ success: true });
  },

  async toggleWatch(id: string) {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const email = session.user?.email;
    if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });
    const meeting = await meetingService.toggleWatch(id, email);
    if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(meeting);
  },

  async notify(id: string) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const meeting = await meetingService.getById(id);
    if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Start the meeting now if it's upcoming
    if (new Date(meeting.startDateTime) > new Date()) {
      await meetingRepository.updateStartTime(id, new Date().toISOString());
    }
    if (meeting.notified || meeting.watchers.length === 0) return NextResponse.json({ sent: 0 });
    await meetingRepository.setNotified(id);
    sendMeetingStarted(meeting.watchers, meeting.subject, meeting.joinUrl, meeting.streamUrl).catch((err) => console.error("[NOTIFY] Email failed:", err));
    console.log(`[NOTIFY] Sent to ${meeting.watchers.length} watchers for "${meeting.subject}":`, meeting.watchers);
    return NextResponse.json({ sent: meeting.watchers.length });
  },
};
