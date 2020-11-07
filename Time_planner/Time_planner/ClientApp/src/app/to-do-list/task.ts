import { ListCategory } from "./listCategory";

export interface Task {
  id: number;
  categoryId: number;
  title: string;
  category: ListCategory;
  isDone: boolean;
  priority: number;
  startDate?: Date;
  endDate?: Date;
}
