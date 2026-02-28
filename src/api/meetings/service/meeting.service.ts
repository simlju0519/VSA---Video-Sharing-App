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
  create(dto: CreateMeetingDto): Meeting {
    if (!dto.subject || !dto.startDateTime || !dto.endDateTime) {
      throw new Error("subject, startDateTime, and endDateTime are required");
    }
    return meetingRepository.create(dto.subject, dto.startDateTime, dto.endDateTime, dto.streamUrl, dto.homeTeamLogo, dto.awayTeamLogo);
  },

  getById(id: string): Meeting | undefined {
    return meetingRepository.getById(id);
  },

  listAll(): Meeting[] {
    return meetingRepository.listAll();
  },

  delete(id: string): boolean {
    return meetingRepository.delete(id);
  },
};
