'use client';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'sonner';

import { ChangeEvent, useState } from 'react';
import {
  getPresignedUploadUrl,
  saveFileMetadata,
} from '@/lib/actions/file.actions';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 2,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function UploadButton({
  uid,
  onUploadComplete,
  total,
  limit,
}: {
  uid: string;
  onUploadComplete: () => void;
  total: number;
  limit: number;
}) {
  const [isUploading, setUploading] = useState(false);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileTotal = Array.from(files).reduce(
      (sum, file) => sum + file.size,
      0
    );
    if (total + fileTotal > limit) {
      toast.error(
        'Upload limit exceeded. Please delete some files before uploading new ones.'
      );
      return;
    }
    onUploadComplete();
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await toast.promise(
          (async () => {
            // 1. Get presigned URL
            const result = await getPresignedUploadUrl({
              uid,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            });

            if (!result.success || !result.url || !result.key) {
              throw new Error(
                result.message ?? `Failed to upload ${file.name}`
              );
            }

            // 2. Upload directly to R2
            const uploadRes = await fetch(result.url, {
              method: 'PUT',
              body: file,
              headers: { 'Content-Type': file.type },
            });
            if (!uploadRes.ok) {
              throw new Error(`Upload to storage failed for ${file.name}`);
            }

            // 3. Save metadata to Firestore
            const saveResult = await saveFileMetadata({
              uid,
              key: result.key,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            });

            if (!saveResult.success) {
              throw new Error(
                saveResult.message ?? `Failed to save ${file.name}`
              );
            }
          })(),
          {
            loading: `Uploading ${file.name}...`,
            success: (
              <span>
                {file.name} uploaded successfully.
                <br /> <br />
                Refresh if not updated.
              </span>
            ),
            error: (error) =>
              error instanceof Error
                ? error.message
                : `Failed to upload ${file.name}`,
          }
        );
      }
      onUploadComplete?.();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onUploadComplete?.();
      event.target.value = '';
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Button
      component="label"
      variant="contained"
      disableElevation
      disableRipple
      className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white shadow-drop-2 transition hover:-translate-y-0.5"
      sx={{
        backgroundColor: '#2563eb',
        '&:hover': { backgroundColor: '#1d4ed8' },
        padding: '12px 16px',
        marginTop: 5,
        minWidth: 'auto',
        width: '100%',
      }}
      disabled={isUploading}
    >
      <CloudUploadIcon />
      {isUploading ? 'Uploading...' : 'Upload files'}
      <VisuallyHiddenInput type="file" onChange={handleFileUpload} multiple />
    </Button>
  );
}
