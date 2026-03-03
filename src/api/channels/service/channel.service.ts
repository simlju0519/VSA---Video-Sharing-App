import { channelRepository, Channel } from "../repository/channel.repository";

export interface CreateChannelDto {
  name: string;
  streamUrl: string;
  category: string;
}

export const channelService = {
  async listAll(): Promise<Channel[]> {
    return channelRepository.listAll();
  },

  async create(dto: CreateChannelDto): Promise<Channel> {
    if (!dto.name || !dto.streamUrl) throw new Error("name and streamUrl are required");
    return channelRepository.create(dto.name, dto.streamUrl, dto.category || "Other");
  },

  async delete(id: string): Promise<boolean> {
    return channelRepository.delete(id);
  },
};
