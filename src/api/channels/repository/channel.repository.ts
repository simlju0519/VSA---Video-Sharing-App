import { randomUUID } from "crypto";

export interface Channel {
  id: string;
  name: string;
  streamUrl: string;
  category: string;
}

const channels: Channel[] = [
  { id: randomUUID(), name: "TV4 Play - SHL", streamUrl: "https://www.tv4play.se/kategorier/shl", category: "Sports" },
  { id: randomUUID(), name: "TV4 Play - Live", streamUrl: "https://www.tv4play.se/live", category: "Live TV" },
  { id: randomUUID(), name: "TV4 Play - Fotboll", streamUrl: "https://www.tv4play.se/kategorier/fotboll", category: "Sports" },
];

export const channelRepository = {
  listAll(): Channel[] {
    return channels;
  },

  getById(id: string): Channel | undefined {
    return channels.find((c) => c.id === id);
  },

  create(name: string, streamUrl: string, category: string): Channel {
    const channel: Channel = { id: randomUUID(), name, streamUrl, category };
    channels.push(channel);
    return channel;
  },

  delete(id: string): boolean {
    const idx = channels.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    channels.splice(idx, 1);
    return true;
  },
};
