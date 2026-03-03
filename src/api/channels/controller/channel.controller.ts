import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { channelService, CreateChannelDto } from "../service/channel.service";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  return !!session;
}

export const channelController = {
  async listAll() {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await channelService.listAll());
  },

  async create(req: NextRequest) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      const body: CreateChannelDto = await req.json();
      return NextResponse.json(await channelService.create(body), { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create channel";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  },

  async delete(id: string) {
    if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await channelService.delete(id);
    return NextResponse.json({ success: true });
  },
};
