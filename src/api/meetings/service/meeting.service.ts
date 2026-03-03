import { meetingRepository, Meeting } from "../repository/meeting.repository";

export interface CreateMeetingDto {
  subject: string;
  startDateTime: string;
  endDateTime: string;
  streamUrl?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

export const meetingService = {
  async create(dto: CreateMeetingDto): Promise<Meeting> {
    if (!dto.subject || !dto.startDateTime || !dto.endDateTime) {
      throw new Error("subject, startDateTime, and endDateTime are required");
    }
    return meetingRepository.create(dto.subject, dto.startDateTime, dto.endDateTime, dto.streamUrl, dto.homeTeamLogo, dto.awayTeamLogo);
  },

  async getById(id: string): Promise<Meeting | undefined> {
    return meetingRepository.getById(id);
  },

  async listAll(): Promise<Meeting[]> {
    return meetingRepository.listAll();
  },

  async delete(id: string): Promise<boolean> {
    return meetingRepository.delete(id);
  },

  async toggleWatch(id: string, email: string): Promise<Meeting | undefined> {
    await meetingRepository.toggleWatch(id, email);
    return meetingRepository.getById(id);
  },
};
