// Constants for audio asset paths, in 'public' directory //

const MULTI_DIR = './audio/multi-sample-instruments/';
const SINGLE_DIR = './audio/single-samples/';

/* TODO: Make this dynamic:

    Create utility functions to get midi notes, extension and instr name dynamically:
    - approaches: 
        a) from file paths (named by midi notes), 
        b) from manifest file, 
        c) other simple methods? (API?)
    - research the manifest file approach
*/

// Use set instead of array
// Store as sorted array for direct ordered access
const DEFAULT_MULTI_INSTR_MIDINOTES = [48, 50, 52, 53, 55, 57].sort(
  (a, b) => a - b
);
// from C4: [60, 62, 64, 65, 67, 69]

// Default multi-sample instrument:
const DEFAULT_MULTI_SAMPLE_INSTRUMENT = {
  instrumentName: 'soft-piano',
  directory: MULTI_DIR + 'default/',
  fileExt: 'mp3',
  // midiNotes: DEFAULT_MULTI_INSTR_MIDINOTES,
  // paths: DEFAULT_MULTI_INSTR_MIDINOTES.map(
  //   (note) => `${MULTI_DIR}default/${note}.mp3`
  // ),
  samples: DEFAULT_MULTI_INSTR_MIDINOTES.map((midiNote) => ({
    midiNote,
    path: `${MULTI_DIR}default/${midiNote}.mp3`,
  })),
};

// Default single-sample instrument:
const DEFAULT_SINGLE_SAMPLE_INSTRUMENT = {
  instrumentName: 'defaultSample',
  fileExt: 'mp3',
  directory: SINGLE_DIR + 'default/',
  midiNote: 60,
  path: SINGLE_DIR + 'default/' + 'sPno_60.mp3',
};

export const DEFAULT_INSTRUMENTS = {
  singleSample: DEFAULT_SINGLE_SAMPLE_INSTRUMENT,
  multiSample: DEFAULT_MULTI_SAMPLE_INSTRUMENT,
};
