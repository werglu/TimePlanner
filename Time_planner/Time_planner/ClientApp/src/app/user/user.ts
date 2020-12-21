import { ListCategory } from "../to-do-list/listCategory";
import { Events } from "../calendar/events";

export interface User {
  facebookId: string;
  theme: number;
  attendedEvents: Events[];
  ownedTaskCategories: ListCategory[];
  notifications: Notification[];
}
