import { IDB } from '../idb/idb';
import { User } from '../../shared/schema/user';

///// CHECK DEXIE DOCS FOR EXISTING REPO FUNCTIONALITY ////

export const UserRepo = {
  async getAll(): Promise<User[]> {
    return IDB.users.toArray();
  },

  async getById(id: string): Promise<User | undefined> {
    return IDB.users.get(id);
  },

  async getByEmail(email: string): Promise<User | undefined> {
    return IDB.users.where('email').equals(email).first();
  },

  async create(user: User): Promise<string> {
    return IDB.users.add(user);
  },

  async update(user: User): Promise<number> {
    return IDB.users.update(user.id!, user);
  },

  async delete(id: string): Promise<void> {
    return IDB.users.delete(id);
  },
};
