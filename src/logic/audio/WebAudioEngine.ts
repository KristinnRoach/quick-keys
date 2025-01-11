import { WebAudioEngineConfig, DEFAULT_CONFIG } from '../config';
import { DEFAULT_VELOCITY, MidiNoteUtils } from '../../global/define/midiNote';

export type VoiceNode = { source: AudioBufferSourceNode; gain: GainNode };

type SamplePath = {
  midiNote: number;
  path: string;
};

type Instrument = {
  midiBufferMap: Map<number, AudioBuffer>; // key: midiNote, value: AudioBuffer
  midiStartTimeMap: Map<number, number>; // key: midiNote, value: startTime (default is after silenceThreshold is reached) // Or trim it off
  // attack / release, endtime, loop points, peak volume, etc..
  // nrSamples: number;
  // midiNotes: number[];
  // velocityLayers?
  // random / variations ?
};

export const DEFAULT_ATTACK = 0.01;
export const DEFAULT_RELEASE = 0.05;

export class WebAudioEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  silenceThreshold: number = 0.18; // test values on different samples after adding amplitude normalization
  rootMidiNote: number = 60; // C4 - Middle C

  private config: WebAudioEngineConfig;
  private loadedInstruments: Map<string, Instrument> = new Map(); // key: id ?? , value: instrument

  // could be generalized to just 'selectedInstrument/s.buffers' and if single-sample mode than only uses C4 (or closest C or user selected root pitch)
  private singleSampleBuffers: Map<number, AudioBuffer> = new Map(); // key: index, value: audio buffer
  private multiSampleBuffers: Map<number, AudioBuffer> = new Map(); // key: midi note, value: audio buffer

  private activeVoiceNodes: Map<number, VoiceNode> = new Map();
  private samplerMode: 'single-sample' | 'multi-sample';

  constructor() {
    this.config = DEFAULT_CONFIG;
    this.context = new AudioContext();

    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 1;
    this.masterGain.connect(this.context.destination);

    this.samplerMode = this.config.sampler_mode;
    // console.log('instr: ', this.config.defaultInstruments);
  }

  async initialize(): Promise<void> {
    if (this.samplerMode === 'multi-sample') {
      await this.loadMulti(this.config.defaultInstruments.multiSample.samples);
    } else if (this.samplerMode === 'single-sample') {
      await this.loadSingle(this.config.defaultInstruments.singleSample.path);
    } else {
      throw new Error('Invalid sampler mode');
    }
  }

  async ensureContextRunning(): Promise<void> {
    if (this.context.state !== 'running') {
      await this.context.resume();
    }
  }

  async setSamplerMode(mode: 'single-sample' | 'multi-sample'): Promise<void> {
    if (mode === this.samplerMode) return;

    if (this.activeVoiceNodes.size > 0) {
      this.activeVoiceNodes.forEach((voice) => voice.source.stop());
      this.activeVoiceNodes.clear();
    }

    if (mode === 'multi-sample' && this.multiSampleBuffers.size === 0) {
      await this.loadMulti(this.config.defaultInstruments.multiSample.samples);
    } else if (
      mode === 'single-sample' &&
      this.singleSampleBuffers.size === 0
    ) {
      await this.loadSingle(this.config.defaultInstruments.singleSample.path);
    }

    this.samplerMode = mode;
  }

  // multi-channel version (slow?)
  private detectThresholdCrossing(audioBuffer: AudioBuffer): number {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = Array.from({ length: numChannels }, (_, i) =>
      audioBuffer.getChannelData(i)
    );

    for (let i = 0; i < samples[0].length; i++) {
      const maxAmplitude = Math.max(
        ...samples.map((channel) => Math.abs(channel[i]))
      );
      if (maxAmplitude > this.silenceThreshold) {
        return i / sampleRate;
      }
    }
    return 0;
  }

  async fetchAudioFile(path: string): Promise<ArrayBuffer> {
    const response = await fetch(path);
    // console.log(
    //   'Fetching from path:',
    //   path,
    //   '\nStatus:',
    //   response.status,
    //   '\nContent-Type:',
    //   response.headers.get('Content-Type')
    // );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch audio file: ${path} (${response.status})`
      );
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 2000) {
      console.warn('Warning: Received suspiciously small audio file');
    }
    return buffer;
  }

  async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.context) {
      throw new Error('Audio context not initialized');
    }
    if (!(this.context.state === 'running')) {
      this.context.resume();
      console.log('Resuming audio context');
    }
    if (!arrayBuffer) {
      throw new Error('Array buffer is empty');
    }

    return this.context.decodeAudioData(arrayBuffer);
  }

  async loadSingle(path: string): Promise<void> {
    this.rootMidiNote = this.config.defaultInstruments.singleSample.midiNote; // REFACTOR THIS !!

    const arrayBuffer = await this.fetchAudioFile(path);
    const audioBuffer = await this.decodeAudioData(arrayBuffer);

    const thresholdTime = this.detectThresholdCrossing(audioBuffer);
    // console.log('start time after silence threshold: ', thresholdTime);

    const audioBufferMap = new Map<number, AudioBuffer>();
    audioBufferMap.set(0, audioBuffer);

    this.singleSampleBuffers.clear();
    this.singleSampleBuffers = audioBufferMap;
  }

  async loadMulti(samples: SamplePath[]): Promise<void> {
    const midiBufferMap: Map<number, AudioBuffer> = new Map();
    const midiStartTimeMap: Map<number, number> = new Map();

    try {
      console.log('trying to load multi');
      await Promise.all(
        samples.map(async ({ midiNote, path }) => {
          const arrayBuffer = await this.fetchAudioFile(path);
          const audioBuffer = await this.decodeAudioData(arrayBuffer);

          const thresholdTime = this.detectThresholdCrossing(audioBuffer);
          // console.log('start time after silence threshold: ', thresholdTime);

          this.multiSampleBuffers.set(midiNote, audioBuffer); // Remove and use midiToBuffers -> loadedInstruments instead ??

          midiBufferMap.set(midiNote, audioBuffer);
          midiStartTimeMap.set(midiNote, thresholdTime);
          // for now, only one loaded instrument at a time with id = '0'
        })
      );

      this.loadedInstruments.set('0', {
        midiBufferMap,
        midiStartTimeMap,
      });

      console.log('Loaded samples:', this.multiSampleBuffers);
    } catch (error) {
      console.error('Failed to load multi-samples:', error);
      throw error;
    }
  }

  createVoiceNode(buffer: AudioBuffer): VoiceNode {
    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.context.createGain();
    source.connect(gainNode).connect(this.masterGain);

    return { source: source, gain: gainNode };
  }

  getBufferFromMidi(
    midiNote: number,
    mode: 'single-sample' | 'multi-sample' = this.samplerMode
  ) {
    console.log('mode: ', mode);
    switch (mode) {
      case 'single-sample': // Todo: handle current single sample index if more than one loaded
        return {
          buffer: this.singleSampleBuffers.get(0),
          sampleMidiNote: this.rootMidiNote,
          // TODO: startTime
        };
      case 'multi-sample':
        if (this.multiSampleBuffers.has(midiNote)) {
          return {
            buffer: this.multiSampleBuffers.get(midiNote),
            sampleMidiNote: midiNote,
            startTime: this.loadedInstruments
              .get('0')
              .midiStartTimeMap.get(midiNote),
          };
        } else {
          const closestMidiNote = this.getClosestMidiNote(midiNote);
          if (closestMidiNote === null) {
            throw new Error('No samples available');
          }
          return {
            buffer: this.multiSampleBuffers.get(closestMidiNote),
            sampleMidiNote: closestMidiNote,
            startTime: this.loadedInstruments
              .get('0')
              .midiStartTimeMap.get(closestMidiNote),
          };
        }
      default:
        throw new Error('Invalid sampler mode');
    }
  }

  getClosestMidiNote(midiNote: number): number | null {
    const availableMidiNotes = Array.from(this.multiSampleBuffers.keys());

    if (availableMidiNotes.length === 0) {
      return null;
    }

    return availableMidiNotes.reduce((closest, current) => {
      const currentDiff = Math.abs(current - midiNote);
      const closestDiff = Math.abs(closest - midiNote);
      return currentDiff < closestDiff ? current : closest;
    });
  }

  playNote(midiNote: number, velocity: number = DEFAULT_VELOCITY): void {
    const { buffer, sampleMidiNote, startTime } =
      this.getBufferFromMidi(midiNote); // midiOffset => semitone offset of buffer pitch from requested midi note
    const voice = this.createVoiceNode(buffer);

    // Calculate playback rate based on the sampleMidiNote and requested note to be played
    let sampleFreq = 440 * Math.pow(2, (sampleMidiNote - 69) / 12);
    const noteFreq = 440 * Math.pow(2, (midiNote - 69) / 12);
    voice.source.playbackRate.value = noteFreq / sampleFreq;

    const time = this.context.currentTime; // use the same 'currentTime' for precise scheduling
    this.triggerAttack(time, voice, velocity);

    voice.source.start(time, startTime ?? 0);
    this.activeVoiceNodes.set(midiNote, voice);
  }

  stopNote(midiNote: number): void {
    const voice = this.activeVoiceNodes.get(midiNote);
    if (voice) {
      const time = this.context.currentTime;
      this.triggerRelease(time, voice);
      voice.source.stop(time + DEFAULT_RELEASE);
      this.activeVoiceNodes.delete(midiNote);
    }
  }

  triggerAttack(when: number, voiceNode: VoiceNode, velocity: number): void {
    voiceNode.gain.gain.cancelScheduledValues(this.context.currentTime);
    voiceNode.gain.gain.setValueAtTime(0, this.context.currentTime);
    voiceNode.gain.gain.linearRampToValueAtTime(
      velocity / 127,
      when + DEFAULT_ATTACK
    );
  }

  triggerRelease(when: number, voiceNode: VoiceNode): void {
    voiceNode.gain.gain.cancelScheduledValues(this.context.currentTime);
    voiceNode.gain.gain.setValueAtTime(voiceNode.gain.gain.value, when);
    voiceNode.gain.gain.linearRampToValueAtTime(0, when + DEFAULT_RELEASE);
  }
}

// mono version - REMOVE
// private detectThresholdCrossing(audioBuffer: AudioBuffer): number {
//   const samples = audioBuffer.getChannelData(0);
//   const sampleRate = audioBuffer.sampleRate;

//   for (let i = 0; i < samples.length; i++) {
//     if (Math.abs(samples[i]) > this.silenceThreshold) {
//       return i / sampleRate; // Convert samples to seconds
//     }
//   }
//   return 0; // No threshold crossing found
// }

// async loadMulti(dirPath: string) {
//   // fetch all audio files in directory
//   // decode audio data
//   // map each audio buffer to a midi note
//   // assuming file names are midi note values (e.g. 60.mp3, 62.mp3, etc.)
//   // replace with manifest file approach if needed - what are the benefits?
//   // For now, assume all files are valid audio files named after their MIDI note value + extension
//   // Clear and replace 'multiSampleBuffers' map with new audio buffers
//   console.log('Not implemented yet');
// }

// async fetchAndDecodeAudio(path: string): Promise<Map<number, AudioBuffer>> {
//   // Todo: research difference between resolving the promises here versus returning a promise
//   let audioBufferMap = new Map<number, AudioBuffer>();

//   if (this.samplerMode === 'multi-sample') {
//     console.log('multi-sample mode- fetchAndDecodeAudio - IMPLEMENT ME');

//     // const promises = manifest.map(async (midiNote: string) => {
//     //   const response = await fetch(path + midiNote);
//     //   const arrayBuffer = await response.arrayBuffer();
//     //   const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
//     //   // audio files need to be named after their MIDI note value
//     //   // Todo: make robust

//     //   // multi-sample mode: maps file-name as midi note to each audio buffer
//     //   audioBufferMap.set(parseInt(midiNote), audioBuffer);
//     // });
//   } else if (this.samplerMode === 'single-sample') {
//     const arrayBuffer = await this.fetchAudioFile(path);

//     // Check if ArrayBuffer actually has content
//     console.log('ArrayBuffer length:', arrayBuffer.byteLength);

//     // Look at first few bytes to check header
//     const firstBytes = new Uint8Array(arrayBuffer.slice(0, 4));
//     console.log('First bytes:', Array.from(firstBytes));

//     const audioBuffer = await this.decodeAudioData(arrayBuffer);
//     audioBufferMap.set(0, audioBuffer);
//   }

//   console.log('audioBufferMap', audioBufferMap);

//   return audioBufferMap;
// }
