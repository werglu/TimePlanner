import { CalendarEvent } from "angular-calendar";

export interface CalendarElement extends CalendarEvent {
  description: string;
  place?: string;
}
