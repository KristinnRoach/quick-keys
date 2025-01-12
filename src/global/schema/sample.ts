/* Currently using the same types for both the core and data-layer */

export type InstrumentParam = keyof InstrumentSettings;

export type InstrumentID = number; // for now

export type Instrument = {
  // design to be able to easily select multiple instruments for playback.
  // 'layered instruments', e.g. as Instrument[]
  // To save 'layered instrument' as new Instrument resampling is probably most straight-forward

  id?: number;
  sampleIDs: number[];
  isSingleSample: boolean;
  params: InstrumentSettings;

  // midiNotes: number[];
  // velocityLayers?
  // random variation layers?
};

export type Sample = {
  id?: number;
  blob: Blob;
  name: string;
  slug: string;
  userId: number;

  rootMidiNote: number;
  bufferDuration: number;

  fileInfo?: AudioFileInfo;

  createdAt: Date;
  updatedAt: Date;
  lastUsed: Date;
};

export type InstrumentSettings = {
  id?: number;
  instrumentID: number;

  volume: number;
  startPoint: number;
  playDuration: number; // same as endpoint

  loopVolume?: number; // TODO: implement
  loopStart: number;
  loopDuration: number;

  // 'always' and 'never' disable normal toggle keys (e.g. caps and tab for loop and hold)
  // 'ping-pong' only affects looping
  //  todo: possibly add keycombos for toggling 'reverse' and 'ping-pong', only keep if results are interesting

  playback_mode: {
    loop: 'normal' | 'always' | 'never';
    one_shot: 'normal' | 'always' | 'never';
    reverse: 'normal' | 'always' | 'never';
    ping_pong: 'normal' | 'always' | 'never';
  };

  transposition: {
    semitones: number;
    detune: number;
  };

  attackTime: number;
  releaseTime: number;

  lpf_cutoff: number;
  hpf_cutoff: number;
};

// TODO: Check if this is needed / remove redundant options
// Move this to validation service interface?
export type AudioFileInfo = {
  mime_type: 'string';
  sampleRate: number;
  bitDepth?: number;
  format?: string;
  extension?: 'string';
};
