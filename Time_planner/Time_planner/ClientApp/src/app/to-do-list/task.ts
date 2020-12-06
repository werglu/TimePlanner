import { ListCategory } from "./listCategory";

export interface Task {
  id: number;
  categoryId: number;
  title: string;
  category: ListCategory;
  isDone: boolean;
  priority: number;
  date0?: Date;
  date1?: Date;
  date2?: Date;
  date3?: Date;
  date4?: Date;
  date5?: Date;
  date6?: Date;
  days?: number;
  time?: number;
  split?: number;
  city?: string;
  streetAddress?: string;
  latitude?: number;
  longitude?: number;
}
