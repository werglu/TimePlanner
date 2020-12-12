import { User } from "../user/user";

export interface Events {
  id: number;
  startDate: Date;
  endDate: Date;
  title: string;
  isPublic: boolean;
  city: string;
  streetAddress: string;
  latitude: number;
  longitude: number;
  ownerId: string;
  owner: User;
  description: string;
}

export interface UsersEvents {
  id: number;
  eventId: number;
  userId: string;
  status: number;
}
