import { channelRepository, Channel } from "../repository/channel.repository";

export interface CreateChannelDto {
  name: string;
  streamUrl: string;
  category: string;
}

export const channelService = {
  listAll(): Channel[] {
    return channelRepository.listAll();
  },

  create(dto: CreateChannelDto): Channel {
    if (!dto.name || !dto.streamUrl) throw new Error("name and streamUrl are required");
    return channelRepository.create(dto.name, dto.streamUrl, dto.category || "Other");
  },

  delete(id: string): boolean {
    return channelRepository.delete(id);
  },
};
