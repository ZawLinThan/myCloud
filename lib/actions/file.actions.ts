// lib/actions/file.actions.ts
'use server';

import { doc, setDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { r2 } from '../r2/r2';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { fileFormat } from '@/lib/types/types';

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
    })
  );

  // 1. Upload to R2
  const url = `https://${process.env.R2_PUBLIC_URL}/${key}`;

  // 2. Save metadata to Firestore
  await setDoc(
    doc(db, 'users', uid),
    {
      files: arrayUnion({
        name: file.name,
        url,
        key, // ← save key too so you can delete later
        size: file.size,
        type: getFileTypeFromMime(file.type),
        extension: getFileExtension(file.name),
        uploadedAt: new Date().toISOString(),
      }),
    },
    { merge: true }
  );

  return { success: true, url };
};

export const getFiles = async (uid: string) => {
  const snap = await getDoc(doc(db, 'users', uid));

  if (!snap.exists()) return { success: false, files: [] };

  const data = snap.data();
  const files = data.files;

  return { success: true, files: files };
};
