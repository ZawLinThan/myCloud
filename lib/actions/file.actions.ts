// lib/actions/file.actions.ts
'use server';

import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { r2 } from '../r2/r2';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
    doc(db, 'users', file.name + uid),
    {
      files: arrayUnion({
        name: file.name,
        url,
        key, // ← save key too so you can delete later
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      }),
    },
    { merge: true }
  );

  return { success: true, url };
};
