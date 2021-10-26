import { User } from "./user";

export interface Message {
  created_at: Date;
  id: string;
  text: string;
  user: User;
  user_id: string;
}
