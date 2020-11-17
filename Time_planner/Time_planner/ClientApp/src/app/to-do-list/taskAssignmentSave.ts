import { ListCategory } from "./listCategory";
import { Task } from "./task";

export interface TaskAssignmentSave {
  taskId: number;
  dayTimes: boolean[];
}
