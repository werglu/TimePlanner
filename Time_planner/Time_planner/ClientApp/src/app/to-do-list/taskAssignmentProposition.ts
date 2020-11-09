import { ListCategory } from "./listCategory";
import { Task } from "./task";

export interface TaskAssignmentProposition {
  task: Task;
  dayTimes: { start: Date, end: Date }[];
}
