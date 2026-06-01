import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from './r2';

export const uploadFile = async (
  file: Buffer,
  key: string,
  contentType: string
) => {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key, // e.g. "uid_abc123/photo.jpg"
      Body: file,
      ContentType: contentType,
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
};

export const deleteFile = async (key: string) => {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
};
