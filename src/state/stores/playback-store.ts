// src/state/stores/playbackStore.ts
import { createStore } from 'solid-js/store';
import { WebAudioEngine } from '../../logic/audio/WebAudioEngine';
import { MidiNoteUtils } from '../../global/define/midiNote';

// SHOULD BE USING createSignal INSTEAD OF createStore ??

export const createPlaybackStore = (audioEngine: WebAudioEngine) => {
  const [state, setState] = createStore({
    isInitialized: false,
    activeNotes: new Set<number>(),
    instrumentMode: 'single-sample', // 'multi-sample' as 'single-sample' | 'multi-sample',
  });

  return [
    state,
    {
      initialize: async () => {
        await audioEngine.initialize();
        setState('isInitialized', true);
      },
      toggleSamplerMode: () => {
        // check this
        const newMode =
          state.instrumentMode === 'multi-sample'
            ? 'single-sample'
            : 'multi-sample';

        setState('instrumentMode', newMode);
        audioEngine.setSamplerMode(newMode as 'single-sample' | 'multi-sample');
      },
      playNote: (midiNote: number) => {
        if (!MidiNoteUtils.isMidiValue(midiNote)) return;
        // todo: add velocity
        audioEngine.playNote(midiNote);
        setState('activeNotes', (prev) => new Set(prev).add(midiNote));
      },
      stopNote: (midiNote: number) => {
        audioEngine.stopNote(midiNote);
        setState('activeNotes', (prev) => {
          const newSet = new Set(prev);
          newSet.delete(midiNote);
          return newSet;
        });
      },
    },
  ] as const;
};
