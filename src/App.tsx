// src/App.tsx
import { Component, createSignal } from 'solid-js';
import { WebAudioEngine } from './logic/audio/WebAudioEngine';
import { createPlaybackStore } from './state/stores/playback-store';
import { KeyboardController } from './ui/input/KeyboardController';
import KeyboardSpline from './ui/ui-components/KeyboardSpline';

const App: Component = () => {
  const audioEngine = new WebAudioEngine();

  const [playbackState, playbackActions] = createPlaybackStore(audioEngine);

  // Initialize audio engine on mount
  playbackActions.initialize();

  return (
    // <div class='min-h-screen bg-gray-900 text-white p-4'>
    <div class='min-h-screen bg-gray-900 text-white p-4 flex flex-col justify-center items-center'>
      {playbackState.isInitialized ? (
        <>
          <KeyboardController
            onNoteOn={playbackActions.playNote}
            onNoteOff={playbackActions.stopNote}
          />

          <div id='keyboardWrapper'>
            <KeyboardSpline
            // Optional props:
            // width='100vw'
            // height='100vh'
            // mixBlendMode='hard-light'
            // sceneUrl='https://your-custom-scene-url.splinecode' // Optional: will use default if not provided
            />
          </div>

          <div>
            <button
              class='toggle-button'
              onClick={playbackActions.toggleSamplerMode}
            >
              Toggle: {playbackState.instrumentMode}
            </button>
          </div>

          <div class='mt-4'>
            Active Notes: {Array.from(playbackState.activeNotes).join(', ')}
          </div>
        </>
      ) : (
        <div>Initializing...</div>
      )}
    </div>
  );
};

export default App;
