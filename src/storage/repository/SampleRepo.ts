import { IDB } from '../idb/idb';
import {
  Sample,
  SampleSettings,
  SampleParam,
} from '../../shared/schema/sample';

///// CHECK DEXIE DOCS FOR EXISTING REPO FUNCTIONALITY ////

export const SampleRepo = {
  async getSamples(): Promise<Sample[]> {
    return IDB.samples.toArray();
  },

  async getSampleById(id: number): Promise<Sample | undefined> {
    return IDB.samples.get(id);
  },

  async getSampleBySlug(slug: string): Promise<Sample | undefined> {
    return IDB.samples.where('slug').equals(slug).first();
  },

  async getSampleSettingsBySampleId(
    sampleId: number
  ): Promise<SampleSettings[]> {
    return IDB.sampleSettings.where('sampleId').equals(sampleId).toArray();
  },

  async getSampleSettingsBySampleIdAndParam(
    sampleId: number,
    param: SampleParam
  ): Promise<SampleSettings | undefined> {
    return IDB.sampleSettings.where({ sampleId, param }).first();
  },

  async saveSample(sample: Sample): Promise<number> {
    return IDB.samples.add(sample);
  },

  async saveSampleSettings(sampleSettings: SampleSettings): Promise<number> {
    return IDB.sampleSettings.add(sampleSettings);
  },

  async updateSampleSettings(sampleSettings: SampleSettings): Promise<number> {
    return IDB.sampleSettings.put(sampleSettings);
  },
};
