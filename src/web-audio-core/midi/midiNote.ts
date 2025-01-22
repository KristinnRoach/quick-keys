// src/global/types.ts

// Refactor, considering I only really use MidiNoteUtils

//// Interface ////

// export interface MidiNote {
//   midiNote: number;
//   velocity: number;
// }

//// Types ////

export type NoteNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type OctaveNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type NoteName =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B';

export type NoteNameWithOctave = `${NoteName}${OctaveNumber}`;
type Hz = number;

export type NoteInfo = {
  note: NoteNumber;
  oct: OctaveNumber;
  name: NoteNameWithOctave;
  freq: Hz;
};

//// Constants ////

export const NoteNames: NoteName[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];
export const Octaves: OctaveNumber[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const NoteNamesWithOctaves: NoteNameWithOctave[] = NoteNames.flatMap(
  (note) => Octaves.map((octave) => `${note}${octave}` as NoteNameWithOctave)
);
export const NoteNumbers: NoteNumber[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const OctaveNumbers: OctaveNumber[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

//// Utility Functions ////

const isMidiValue = (x: number) => x >= 0 && x <= 127;

const getFrequency = (note: NoteNumber, octave: OctaveNumber) =>
  440 * Math.pow(2, (octave * 12 + note - 69) / 12);

const getNoteNumber = (midiNote: number): NoteNumber =>
  (midiNote % 12) as NoteNumber;

const getOctaveNumber = (midiNote: number): OctaveNumber =>
  (Math.floor(midiNote / 12) - 1) as OctaveNumber;

const getNoteName = (
  noteNumber: NoteNumber,
  octave: OctaveNumber
): NoteNameWithOctave =>
  `${NoteNames[noteNumber]}${octave}` as NoteNameWithOctave;

function getNoteInfo(midiNote: number): NoteInfo {
  const noteNumber = (midiNote % 12) as NoteNumber;
  const octaveNumber = (Math.floor(midiNote / 12) - 1) as OctaveNumber;
  const noteNameWithOctave =
    `${NoteNames[noteNumber]}${octaveNumber}` as NoteNameWithOctave;

  const freq = getFrequency(noteNumber, octaveNumber);

  const pitchInfo = {
    note: noteNumber,
    oct: octaveNumber,
    name: noteNameWithOctave,
    freq: freq,
  };

  return pitchInfo;
}

export const MidiNoteUtils = {
  getNoteInfo,
  isMidiValue,
  // Below are all returned by getNoteInfo
  getFrequency,
  getNoteNumber,
  getOctaveNumber,
  getNoteName,
};
