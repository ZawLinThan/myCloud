export type FileKind = 'document' | 'image' | 'video' | 'audio' | 'other';

export interface fileFormat {
  key: string; // key
  name: string;
  size: number;
  type: FileKind;
  extension?: string;
  //file: FileKind;
  url: string;
}
