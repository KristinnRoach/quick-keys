import { DEFAULT_INSTRUMENTS } from '../../shared/paths';
import { WebAudioEngineConfig } from './WebAudioEngine';

export const DEFAULT_CONFIG: WebAudioEngineConfig = {
  sampler_mode: 'single-sample',
  defaultInstruments: DEFAULT_INSTRUMENTS,
};
