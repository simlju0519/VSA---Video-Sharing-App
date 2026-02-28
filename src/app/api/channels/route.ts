import { NextRequest } from "next/server";
import { channelController } from "@/api/channels/controller/channel.controller";

export async function GET() {
  return channelController.listAll();
}

export async function POST(req: NextRequest) {
  return channelController.create(req);
}
