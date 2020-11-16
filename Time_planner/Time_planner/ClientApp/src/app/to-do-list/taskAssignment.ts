import { ListCategory } from "./listCategory";
import { Task } from "./task";

export interface TaskAssignment {
  task: Task;
  dayTimes: boolean[];
  infos: string[];
  count: number;
}
