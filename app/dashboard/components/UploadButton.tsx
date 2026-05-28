'use client';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

export default function UploadButton() {
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
        padding: 0,
        marginTop: 5,
        // Ensure minWidth doesn't interfere
        minWidth: 'auto',
        // Make sure the button takes full width
        width: '100%',
        height: '5%',
      }}
    >
      <CloudUploadIcon />
      <VisuallyHiddenInput
        type="file"
        onChange={(event) => console.log(event.target.files)}
        multiple
      />
    </Button>
  );
}
