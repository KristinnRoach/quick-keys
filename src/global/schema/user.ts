export interface User {
  id?: string;
  name: string;
  email: string;
  lastLogin: Date;
}

export type UserId = number; // for now
