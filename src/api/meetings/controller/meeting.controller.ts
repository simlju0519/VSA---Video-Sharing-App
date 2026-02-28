import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { meetingService, CreateMeetingDto } from "../service/meeting.service";

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
      const meeting = meetingService.create(body);
      return NextResponse.json(meeting, { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create meeting";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },

  async getById(id: string) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const meeting = meetingService.getById(id);
    if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(meeting);
  },

  async listAll() {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(meetingService.listAll());
  },

  async delete(id: string) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    meetingService.delete(id);
    return NextResponse.json({ success: true });
  },
};
