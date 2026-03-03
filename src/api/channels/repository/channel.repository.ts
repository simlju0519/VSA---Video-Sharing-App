import { randomUUID } from "crypto";
import { query } from "@/lib/db";

export interface Channel {
  id: string;
  name: string;
  streamUrl: string;
  category: string;
}

interface ChannelRow { id: string; name: string; stream_url: string; category: string }

function toChannel(r: ChannelRow): Channel {
  return { id: r.id, name: r.name, streamUrl: r.stream_url, category: r.category };
}

export const channelRepository = {
  async listAll(): Promise<Channel[]> {
    return (await query<ChannelRow>("SELECT * FROM channels ORDER BY name")).map(toChannel);
  },

  async getById(id: string): Promise<Channel | undefined> {
    const rows = await query<ChannelRow>("SELECT * FROM channels WHERE id = $1", [id]);
    return rows[0] ? toChannel(rows[0]) : undefined;
  },

  async create(name: string, streamUrl: string, category: string): Promise<Channel> {
    const rows = await query<ChannelRow>(
      "INSERT INTO channels (id, name, stream_url, category) VALUES ($1,$2,$3,$4) RETURNING *",
      [randomUUID(), name, streamUrl, category]
    );
    return toChannel(rows[0]);
  },

  async delete(id: string): Promise<boolean> {
    const rows = await query<ChannelRow>("DELETE FROM channels WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  },
};
