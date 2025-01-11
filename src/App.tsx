// src/App.tsx
import {
  Component,
  createSignal,
  lazy,
  Suspense,
  onMount,
  Show,
} from 'solid-js';
import { WebAudioEngine } from './logic/audio/WebAudioEngine';
import { createPlaybackStore } from './state/stores/playback-store';
import { KeyboardController } from './ui/input/KeyboardController';

// Lazy load non-critical components
const KeyboardSpline = lazy(() => import('./ui/ui-components/KeyboardSpline'));
const Toggle = lazy(() => import('./ui/ui-components/Buttons/Toggle'));

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
    <div class='min-h-screen bg-gray-900 text-white p-4 flex flex-col justify-center items-center'>
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
          <div id='keyboardWrapper'>
            <KeyboardSpline onLoad={() => setSplineLoaded(true)} />
          </div>
        </Suspense>

        <Suspense
          fallback={
            <div class='mt-4 w-24 h-8 bg-gray-800 animate-pulse rounded'></div>
          }
        >
          <Toggle
            mode={playbackState.instrumentMode}
            onClick={playbackActions.toggleSamplerMode}
            class='mt-4'
          />
        </Suspense>

        <Show when={isSplineLoaded()}>
          <div class='mt-4 font-mono text-sm opacity-75'>
            Active Notes: {Array.from(playbackState.activeNotes).join(', ')}
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default App;

//           <div id='keyboardWrapper'>
//             <KeyboardSpline
//             // Optional props:
//             // width='100vw'
//             // height='100vh'
//             // mixBlendMode='hard-light'
//             // sceneUrl='https://your-custom-scene-url.splinecode' // Optional: will use default if not provided
//             />
//           </div>

//           <div>
//             <button
//               class='toggle-button'
//               onClick={playbackActions.toggleSamplerMode}
//             >
//               Toggle: {playbackState.instrumentMode}
//             </button>
//           </div>

//           <div class='mt-4'>
//             Active Notes: {Array.from(playbackState.activeNotes).join(', ')}
//           </div>
//         </>
//       ) : (
//         <div>Initializing...</div>
//       )}
//     </div>
//   );
// };

// export default App;
