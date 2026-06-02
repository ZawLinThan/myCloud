'use client';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import { ClickAwayListener } from '@mui/material';
import ShareFileDropDownMenu from './ShareFileDropDownMenu';
import { useState } from 'react';

export default function FileDropDownMenu({
  isDeleting,
  onClose,
  onDelete,
  onShare,
  index,
}: {
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => void;
  onShare: () => void;
  index: number;
}) {
  const className =
    index == 0
      ? `absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-md border border-app surface py-1 shadow-drop-2`
      : `absolute right-0 bottom-10 top-auto z-20 w-36 overflow-hidden rounded-md border border-app surface py-1 shadow-drop-2`;

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div className={className}>
        <div>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-muted transition hover:bg-black/5 hover:text-app"
            onClick={onShare}
            type="button"
          >
            <IosShareRoundedIcon fontSize="small" />
            Share
          </button>
        </div>

        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDeleting}
          onClick={onDelete}
          type="button"
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </ClickAwayListener>
  );
}
