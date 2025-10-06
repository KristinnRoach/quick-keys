export type UserId = string;

export interface User {
  id?: UserId;
  name: string;
  email: string;
  lastLogin: Date;
}
