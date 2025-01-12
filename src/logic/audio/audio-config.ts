import { DEFAULT_INSTRUMENTS } from '../../global/paths';
import { WebAudioEngineConfig } from './WebAudioEngine';

export const DEFAULT_CONFIG: WebAudioEngineConfig = {
  sampler_mode: 'single-sample',
  defaultInstruments: DEFAULT_INSTRUMENTS,
};
