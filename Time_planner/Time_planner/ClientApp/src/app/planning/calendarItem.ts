import { Events } from '../calendar/events'
import { Task } from '../to-do-list/task'

export interface CalendarItem {
  e: Events;
  t: Task;
  assigned: boolean;
}
