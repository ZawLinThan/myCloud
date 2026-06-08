export type FileKind =
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'other'
  | 'starred'
  | 'trash';

export interface fileFormat {
  key: string; // key
  name: string;
  size: number;
  mimeType: string; // e.g. "image/jpeg"
  type: FileKind;
  extension?: string;
  url: string;
  uploadedAt: string | null;
  starred: boolean;
  trash: boolean;
}

export interface CurrentUser {
  accountId: string;
  email: string | undefined;
  fullName: string;
  avatar: string | null;
  files: fileFormat[];
  purchasedStorageGb: number;
  storageLimitBytes: number;
}
