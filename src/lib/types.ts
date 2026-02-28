export interface Meeting {
  id: string;
  subject: string;
  joinUrl: string;
  startDateTime: string;
  endDateTime: string;
}

export interface CreateMeetingDto {
  subject: string;
  startDateTime: string;
  endDateTime: string;
}
