export interface CalendarEvent {
  id: string;
  date: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title?: string;
  createdAt: Date;
  customLetter?: string;
  color?: string;
}

export type UserMapValue = {
  customLetter?: string;
  displayName: string;
  color?: string;
};
