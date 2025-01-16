/* Currently using the same types for both the core and data-layer */

export type Sample = {
  id?: number;
  instrumentId: number;
  userId: number;

  blob: Blob;
  fileInfo?: AudioFileInfo;

  name: string;
  slug: string;

  rootMidiNote: number;
  bufferDuration: number;

  createdAt: Date;
  updatedAt: Date;
  lastUsed: Date;
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
