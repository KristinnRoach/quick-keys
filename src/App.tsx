// src/App.tsx
import {
  Component,
  createSignal,
  lazy,
  Suspense,
  onMount,
  Show,
} from 'solid-js';
import { WebAudioEngine } from './web-audio-core/audio/WebAudioEngine';
import { createPlaybackStore } from './state/stores/playback-store';
import { KeyboardController } from './web-audio-core/input/KeyboardController';

// Lazy load non-critical components
const KeyboardSpline = lazy(() => import('./ui/components/KeyboardSpline'));
const Toggle = lazy(() => import('./ui/components/buttons/Toggle'));

const App: Component = () => {
  const [isOffline, setIsOffline] = createSignal(false);
  const [isSplineLoaded, setSplineLoaded] = createSignal(false);

  const audioEngine = new WebAudioEngine();
  const [playbackState, playbackActions] = createPlaybackStore(audioEngine);

  onMount(() => {
    // Check initial state
    setIsOffline(!navigator.onLine);

    // Initialize
    playbackActions.initialize();

    // Add listeners
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));

    // Clean up on unmount
    return () => {
      window.removeEventListener('online', () => setIsOffline(false));
      window.removeEventListener('offline', () => setIsOffline(true));
    };
  });

  return (
    <div class='min-h-screen bg-gray-900 text-white p-16 flex flex-col items-center'>
      {isOffline() && (
        <div class='fixed top-0 w-full bg-yellow-600 text-white text-center py-2'>
          You are currently offline. Some features may be limited.
        </div>
      )}

      <Show
        when={playbackState.isInitialized}
        fallback={
          <div class='animate-pulse'>
            <span class='inline-block px-4 py-2 bg-gray-800 rounded'>
              Initializing...
            </span>
          </div>
        }
      >
        <KeyboardController
          onNoteOn={playbackActions.playNote}
          onNoteOff={playbackActions.stopNote}
        />

        <Suspense
          fallback={
            <div class='w-full h-64 bg-gray-800 animate-pulse rounded-lg'></div>
          }
        >
          <div
            id='keyboardWrapper'
            class='relative w-full max-w-[1000px] mx-auto'
          >
            <KeyboardSpline
              onLoad={() => setSplineLoaded(true)}
              zoom={1}
              offsetY={50}
              visibleHeight={295}
              class='flex flex-col items-center rounded-lg p-8 mb-24'
            />
            <Suspense
              fallback={
                <div class='absolute left-1/2 -translate-x-1/2 bottom-4 w-24 h-8 bg-gray-800 animate-pulse rounded'></div>
              }
            >
              <Toggle
                mode={playbackState.instrumentMode}
                onClick={playbackActions.toggleSamplerMode}
                class='absolute left-1/2 -translate-x-1/2 bottom-4'
              />
            </Suspense>
          </div>
        </Suspense>

        <Show when={isSplineLoaded()}>
          <div class='mt-4 font-mono text-sm opacity-50'>
            Active Notes: {Array.from(playbackState.activeNotes).join(', ')}
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default App;
