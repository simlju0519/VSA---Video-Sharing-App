export interface Meeting {
  id: string;
  subject: string;
  joinUrl: string;
  startDateTime: string;
  endDateTime: string;
  streamUrl?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  watchers: string[];
  notified: boolean;
}

export interface CreateMeetingDto {
  subject: string;
  startDateTime: string;
  endDateTime: string;
  streamUrl?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

export interface Channel {
  id: string;
  name: string;
  streamUrl: string;
  category: string;
}
