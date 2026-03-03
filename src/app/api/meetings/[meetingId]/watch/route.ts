import { NextRequest } from "next/server";
import { meetingController } from "@/api/meetings/controller/meeting.controller";

interface Params { params: Promise<{ meetingId: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const { meetingId } = await params;
  return meetingController.toggleWatch(meetingId);
}
