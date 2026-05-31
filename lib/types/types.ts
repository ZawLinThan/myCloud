export type FileKind = 'document' | 'image' | 'video' | 'audio' | 'other';

export interface fileFormat {
  key: string; // key
  name: string;
  size: number;
  type: FileKind;
  extension?: string;
  //file: FileKind;
  url: string;
  uploadedAt: string | null;
}

export interface CurrentUser {
  accountId: string;
  email: string | undefined;
  fullName: string;
  avatar: string | null;
  files: fileFormat;
}
