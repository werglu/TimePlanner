import { Events } from "../calendar/events";

export interface Notification {
  id: number;
  messageType: number;
  eventId: number | null;
  event: Events;
  isDismissed: boolean;
}
