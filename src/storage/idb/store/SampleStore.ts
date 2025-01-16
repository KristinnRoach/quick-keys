import { IDB } from '../idb';
import {
  Sample,
  SampleSettings,
  SampleParam,
} from '../../../shared/schema/sample';
export class SampleStore {
  async addSample(sample: Omit<Sample, 'id'>) {
    return await IDB.samples.add(sample);
  }

  async addSettings(settings: Omit<SampleSettings, 'id'>) {
    return await IDB.sampleSettings.add(settings);
  }

  async get(id: number) {
    return await IDB.samples.get(id);
  }

  async update(id: number, updates: Partial<Sample>) {
    return await IDB.samples.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async delete(id: number) {
    await IDB.samples.delete(id);
  }

  async getAllByUser(userId: number) {
    return await IDB.samples.where('userId').equals(userId).toArray();
  }

  /*  Settings methods in the same store since they're tightly coupled  */

  async getSampleWithSettings(sampleId: number) {
    const sample = await this.get(sampleId);
    const settings = await this.getSettings(sampleId);

    if (!sample) return null;

    return {
      ...sample,
      settings,
    };
  }

  async getSettings(sampleId: number) {
    return await IDB.sampleSettings.where('sampleId').equals(sampleId).first();
  }

  async updateSettings(id: number, updates: Partial<SampleSettings>) {
    return await IDB.sampleSettings.update(id, updates);
  }

  async getParam(settingsId: number, param: SampleParam) {
    const settings = await IDB.sampleSettings.get(settingsId);
    return settings?.[param];
  }

  async updateParam(
    settingsId: number,
    param: SampleParam,
    value: number | boolean
  ) {
    return await IDB.sampleSettings.update(settingsId, {
      [param]: value,
    });
  }

  // Possibly remove if not needed
  async batchUpdateParams(
    settingsId: number,
    updates: Partial<SampleSettings>
  ) {
    return await IDB.sampleSettings.update(settingsId, updates);
  }
}

export const sampleStore = new SampleStore();
