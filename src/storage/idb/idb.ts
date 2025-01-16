// src/db/idb.ts
import Dexie, { Table } from 'dexie';
import { User } from '../../shared/schema/user';
import { Sample, SampleSettings } from '../../shared/schema/sample';

class Idb extends Dexie {
  users!: Table<User, string>;
  samples!: Table<Sample>;
  sampleSettings!: Table<SampleSettings>;

  constructor() {
    super('HljodSmali_IDB');

    this.version(1).stores({
      users: 'id, email',
      samples: '++id, userId, slug, createdAt',
      sampleSettings: '++id, sampleId',
    });
  }
}

export const IDB = new Idb();
