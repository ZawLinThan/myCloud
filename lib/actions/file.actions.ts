// lib/actions/file.actions.ts
'use server';

import { doc, setDoc, arrayUnion, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { r2 } from '../r2/r2';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fileFormat } from '../types/types';

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() ?? '';
};

const getFileTypeFromMime = (mimeType: string): string => {
  const types: Record<string, string[]> = {
    image: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
    ],
    video: [
      'video/mp4',
      'video/mkv',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
    ],
    audio: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain',
      'text/rtf',
    ],
    spreadsheet: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv',
    ],
    presentation: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    ],
    archive: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-7z-compressed',
    ],
    code: [
      'text/javascript',
      'text/typescript',
      'text/html',
      'text/css',
      'application/json',
    ],
  };

  for (const [type, mimes] of Object.entries(types)) {
    if (mimes.includes(mimeType)) return type;
  }

  // fallback — catch broad mime categories
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'document';

  return 'other';
};

export const uploadFile = async (formData: FormData) => {
  const file = formData.get('file') as File;
  const uid = formData.get('uid') as string;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const key = `${uid}/${Date.now()}_${file.name}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key, // e.g. "uid_abc123/photo.jpg"
      Body: bytes,
      ContentType: file.type,
      ContentDisposition: 'inline', // so it can be previewed in-browser instead of downloaded
    })
  );

  const fileData = {
    name: file.name,
    key,
    size: file.size,
    mimeType: file.type,
    type: getFileTypeFromMime(file.type),
    extension: getFileExtension(file.name),
    uploadedAt: new Date().toISOString(),
  };

  // Save metadata to Firestore
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    await updateDoc(userRef, { files: arrayUnion(fileData) });
  } else {
    await setDoc(userRef, { files: [fileData] });
  }

  return { success: true };
};

export const getFiles = async (uid: string) => {
  const snap = await getDoc(doc(db, 'users', uid));

  if (!snap.exists()) return { success: false, files: [] };

  const data = snap.data();
  const files = data.files;

  const filesWithUrls = await Promise.all(
    files.map(async (file: fileFormat) => ({
      ...file,
      uploadedAt:
        typeof file.uploadedAt === 'string'
          ? file.uploadedAt
          : ((file.uploadedAt as unknown as { toDate: () => Date })
              ?.toDate?.()
              ?.toISOString() ?? null),
      url: await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: file.key,
          ResponseContentDisposition: 'inline',
          ResponseContentType: file.mimeType,
        }),
        { expiresIn: 3600 }
      ),
    }))
  );

  return { success: true, files: filesWithUrls };
};
