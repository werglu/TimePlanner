import { Task } from "./task";

export interface ListCategory {
  id: number;
  category: string;
  tasks: Task[];
}
