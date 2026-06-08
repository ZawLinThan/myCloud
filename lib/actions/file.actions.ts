// lib/actions/file.actions.ts
'use server';

import {
  doc,
  setDoc,
  arrayUnion,
  getDoc,
  updateDoc,
  query,
  where,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { r2 } from '../r2/r2';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fileFormat } from '../types/types';
import otpService from '../utils/otp';
import { toast } from 'sonner';
import { Resend } from 'resend';
import { getStorageLimitBytes } from '../billing/storage-plans';
import { getCurrentUser } from '../utils/session';

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
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.accountId !== uid) {
    return { success: false, message: 'You must be signed in to upload.' };
  }

  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  const currentFiles =
    snap.exists() && Array.isArray(snap.data().files) ? snap.data().files : [];
  const totalBytes = currentFiles.reduce(
    (sum: number, uploadedFile: fileFormat) => sum + (uploadedFile.size ?? 0),
    0
  );
  const purchasedStorageGb =
    snap.exists() && typeof snap.data().purchasedStorageGb === 'number'
      ? snap.data().purchasedStorageGb
      : 0;
  const storageLimitBytes =
    snap.exists() && typeof snap.data().storageLimitBytes === 'number'
      ? snap.data().storageLimitBytes
      : getStorageLimitBytes(purchasedStorageGb);

  if (totalBytes + file.size > storageLimitBytes) {
    return {
      success: false,
      message: 'Storage limit exceeded. Purchase more storage to continue.',
    };
  }

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
    //protected: false, // default to unprotected, can be updated later
    starred: false, // default to unstarred, can be updated later
    trash: false,
  };

  // Save metadata to Firestore
  if (snap.exists()) {
    await updateDoc(userRef, { files: arrayUnion(fileData) });
  } else {
    await setDoc(userRef, {
      files: [fileData],
      purchasedStorageGb: 0,
      storageLimitBytes: getStorageLimitBytes(0),
    });
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

export const deleteUploadedFile = async ({
  uid,
  key,
  type,
}: {
  uid: string;
  key?: string;
  type: 'single' | 'all';
}) => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return { success: false, message: 'User not found.' };
  }

  let files = Array.isArray(snap.data().files) ? snap.data().files : [];

  if (type === 'all') {
    // Delete all trashed files from R2 and Firestore
    const trashedFiles = files.filter((file: fileFormat) => file.trash);

    await Promise.all(
      trashedFiles.map((file: fileFormat) =>
        r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: file.key,
          })
        )
      )
    );

    files = files.filter((file: fileFormat) => !file.trash);
    await updateDoc(userRef, { files });
  } else {
    // Single delete
    const fileIndex = files.findIndex((file: fileFormat) => file.key === key);

    if (fileIndex === -1) {
      return { success: false, message: 'File not found.' };
    }

    if (files[fileIndex].trash) {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        })
      );
      files = files.filter((file: fileFormat) => file.key !== key);
    } else {
      files[fileIndex].trash = true;
    }

    await updateDoc(userRef, { files });
  }

  return { success: true };
};
export const toggleFileStarred = async ({
  uid,
  key,
}: {
  uid: string;
  key: string;
}) => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return { success: false, message: 'User not found.' };
  }

  const files = Array.isArray(snap.data().files) ? snap.data().files : [];
  const fileIndex = files.findIndex((file: fileFormat) => file.key === key);

  if (fileIndex === -1) {
    return { success: false, message: 'File not found.' };
  }

  files[fileIndex].starred = !files[fileIndex].starred;

  await updateDoc(userRef, { files });

  return { success: true };
};

export const emptyBin = async (uid: string) => {
  deleteUploadedFile({ uid: uid, type: 'all' });
};

export const openProtectedFile = async (uid: string) => {
  // create OTP
  const otp = otpService.generateOtp();
  // hash OTP
  const otpHash = await otpService.hashOtp(otp);
  // assign hashed OTP & expiredAt to the user profile with uid
  const expiredAt = otpService.getOtpExpiry();
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return { success: false, message: 'User not found.' };
  }

  await updateDoc(userRef, { otpHash, otpExpiresAt: expiredAt });
  // send OTP email with Resend
  await toast.promise(
    otpService.sendOtpEmail({ email: snap.data().email, otp }),
    {
      loading: 'Sending OTP...',
      success: 'OTP sent to your email!',
      error: 'Failed to send OTP. Please try again.',
    }
  );
  // call verify otp when the user has entered the OTP
};
export const shareFileViaEmail = async (
  uid: string,
  file: fileFormat,
  to: string
) => {
  // need to get a Domain Verified email address in Resend to send email
  const resend = new Resend(process.env.RESEND_API);

  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) {
    return { success: false, message: 'User not found.' };
  }
  console.log(snap.data());
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: to,
    subject: `${snap.data().name} has shared a file with you on MyCloud!`,
    html: `<p> ${snap.data().name} shared <strong> ${file.name}</strong> with you. It is added to your files list!</p>`,
  });

  const receiverRef = collection(db, 'users');
  const q = query(receiverRef, where('email', '==', to));
  const receiverSnap = await getDocs(q);

  if (receiverSnap.empty) {
    return { success: false, message: 'Receiver not found.' };
  }

  await updateDoc(doc(db, 'users', receiverSnap.docs[0].id), {
    files: arrayUnion(file),
  });

  if (error)
    return {
      success: false,
      message: error.message,
    };

  return {
    success: true,
    message: `OTP sent successfully. ID: ${data.id}`,
  };
};
