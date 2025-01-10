import { DEFAULT_INSTRUMENTS } from '../global/paths';

export interface WebAudioEngineConfig {
  sampler_mode: 'single-sample' | 'multi-sample';
  defaultInstruments?: typeof DEFAULT_INSTRUMENTS;
}

export const DEFAULT_CONFIG: WebAudioEngineConfig = {
  sampler_mode: 'single-sample',
  defaultInstruments: DEFAULT_INSTRUMENTS,
};
