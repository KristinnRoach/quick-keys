export type InstrumentParam = keyof InstrumentSettings;

export type Instrument = {
  // design to be able to easily select multiple instruments for playback.
  // 'layered instruments', e.g. as Instrument[]
  // To save 'layered instrument' as new Instrument resampling is probably most straight-forward

  id?: number;
  sampleIDs: number[];
  isSingleSample: boolean;
  params: InstrumentSettings;

  // sampleID to midinote map?
  // velocityLayers?
  // random variation layers?
};

export type InstrumentSettings = {
  id?: number;
  instrumentID: number;

  volume: number;
  startPoint: number;
  playDuration: number;

  loopVolume?: number;
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
