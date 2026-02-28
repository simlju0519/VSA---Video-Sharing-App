import { NextRequest } from "next/server";
import { meetingController } from "@/api/meetings/controller/meeting.controller";

export async function GET() {
  return meetingController.listAll();
}

export async function POST(req: NextRequest) {
  return meetingController.create(req);
}
