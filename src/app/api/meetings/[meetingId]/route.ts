import { NextRequest } from "next/server";
import { meetingController } from "@/api/meetings/controller/meeting.controller";

interface Params {
  params: Promise<{ meetingId: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { meetingId } = await params;
  return meetingController.getById(meetingId);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { meetingId } = await params;
  return meetingController.delete(meetingId);
}
