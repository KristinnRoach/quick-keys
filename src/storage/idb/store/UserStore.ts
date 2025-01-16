// src/db/store/userStore.ts
import { IDB } from '../idb';
import { User } from '../../../shared/schema/user';

export class UserStore {
  async create(user: Omit<User, 'lastLogin'>) {
    const newUser: User = {
      ...user,
      lastLogin: new Date(),
    };

    return await IDB.users.add(newUser);
  }

  async get(id: string) {
    return await IDB.users.get(id);
  }

  async getByEmail(email: string) {
    return await IDB.users.where('email').equals(email).first();
  }

  async update(id: string, updates: Partial<User>) {
    return await IDB.users.update(id, updates);
  }

  async updateLastLogin(id: string) {
    return await this.update(id, { lastLogin: new Date() });
  }

  async delete(id: string) {
    // Delete user's samples and their settings first
    const userSamples = await IDB.samples.where('userId').equals(id).toArray();

    for (const sample of userSamples) {
      if (sample.id) {
        await IDB.sampleSettings.where('sampleId').equals(sample.id).delete();
      }
    }

    await IDB.samples.where('userId').equals(id).delete();

    // Delete the user
    await IDB.users.delete(id);
  }
}

export const userStore = new UserStore();
