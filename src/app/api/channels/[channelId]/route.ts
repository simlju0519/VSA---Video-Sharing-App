import { NextRequest } from "next/server";
import { channelController } from "@/api/channels/controller/channel.controller";

interface Params {
  params: Promise<{ channelId: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { channelId } = await params;
  return channelController.delete(channelId);
}
