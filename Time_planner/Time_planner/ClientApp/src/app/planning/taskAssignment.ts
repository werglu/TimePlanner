import { Task } from "../to-do-list/task";

export interface TaskAssignment {
  task: Task;
  dayTimes: boolean[];
  infos: string[];
  count: number;
}
