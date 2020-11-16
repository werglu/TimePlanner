import { ListCategory } from "../to-do-list/listCategory";
import { Events } from "../calendar/events";

export interface User {
  facebookId: string;
  attendedEvents: Events[];
  ownedTaskCategories: ListCategory[];
  notifications: Notification[];
}
