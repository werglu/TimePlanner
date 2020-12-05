import { Task } from "../to-do-list/task";

export interface TaskAssignmentProposition {
  task: Task;
  dayTimes: { start: Date, end: Date }[];
}
