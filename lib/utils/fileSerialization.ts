import { fileFormat, FileKind } from '../types/types';

type FirestoreTimestampLike = {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
};

const fileKinds = new Set<FileKind>([
  'audio',
  'document',
  'image',
  'other',
  'video',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeUploadedAt = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (isRecord(value)) {
    const timestamp = value as FirestoreTimestampLike;

    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }

    if (typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000).toISOString();
    }
  }

  return null;
};

const normalizeFileKind = (value: unknown): FileKind =>
  typeof value === 'string' && fileKinds.has(value as FileKind)
    ? (value as FileKind)
    : 'other';

export const serializeFile = (file: unknown): fileFormat | null => {
  if (!isRecord(file)) {
    return null;
  }

  const key = typeof file.key === 'string' ? file.key : '';
  const name = typeof file.name === 'string' ? file.name : 'Untitled file';

  if (!key) {
    return null;
  }

  return {
    extension: typeof file.extension === 'string' ? file.extension : undefined,
    key,
    mimeType: typeof file.mimeType === 'string' ? file.mimeType : '',
    name,
    protected: typeof file.protected === 'boolean' ? file.protected : false,
    size: typeof file.size === 'number' ? file.size : 0,
    type: normalizeFileKind(file.type),
    uploadedAt: normalizeUploadedAt(file.uploadedAt),
    url: typeof file.url === 'string' ? file.url : '',
  };
};

export const serializeFiles = (files: unknown): fileFormat[] =>
  Array.isArray(files)
    ? files.flatMap((file) => {
        const serializedFile = serializeFile(file);
        return serializedFile ? [serializedFile] : [];
      })
    : [];
