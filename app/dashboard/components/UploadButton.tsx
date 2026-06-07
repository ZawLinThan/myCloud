'use client';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'sonner';

import { ChangeEvent, useState } from 'react';
import { uploadFile } from '@/lib/actions/file.actions';

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
  onUploadComplete?: () => void;
  total: number;
  limit: number;
}) {
  const [isUploading, setUploading] = useState(false);

  const handleFileUpload = async (
    event: ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length == 0) {
      return;
    }

    const fileTotal = Array.from(files).reduce(
      (sum, file) => sum + file.size,
      0
    );
    if (total + fileTotal > limit) {
      console.log(`total: ${total}, fileTotal: ${fileTotal}, limit: ${limit}`);
      toast.error(
        'Upload limit exceeded. Please delete some files before uploading new ones.'
      );
      return;
    }

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uid', uid);

        await toast.promise(
          uploadFile(formData).then((result) => {
            if (!result.success) {
              throw new Error(
                result.message || `Failed to upload ${file.name}`
              );
            }

            return result;
          }),
          {
            loading: `Uploading ${file.name}...`,
            success: `${file.name} uploaded successfully`,
            error: (error) =>
              error instanceof Error
                ? error.message
                : `Failed to upload ${file.name}`,
          }
        );
      }
      onUploadComplete?.();
      event.target.value = '';
    } catch (error) {
      console.log(error);
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
        '&:hover': {
          backgroundColor: '#1d4ed8',
        },
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
