import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import { FileKind } from '@/lib/types/types';
import { DashboardTabId } from '../components/DashboardTabs';

export const INITIAL_VISIBLE_FILE_COUNT = 3;

export const fileTypeMeta = {
  document: {
    icon: DescriptionOutlinedIcon,
    label: 'Documents',
    tone: 'bg-blue-50 text-blue-700',
  },
  image: {
    icon: ImageOutlinedIcon,
    label: 'Images',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  video: {
    icon: MovieOutlinedIcon,
    label: 'Videos',
    tone: 'bg-rose-50 text-rose-700',
  },
  audio: {
    icon: MusicNoteOutlinedIcon,
    label: 'Audio',
    tone: 'bg-amber-50 text-amber-700',
  },
  other: {
    icon: InsertDriveFileOutlinedIcon,
    label: 'Other',
    tone: 'bg-slate-100 text-slate-700',
  },
  starred: {
    icon: StarBorderIcon,
    label: 'Starred',
    tone: 'bg-yellow-50 text-yellow-700',
  },
  trash: {
    icon: RestoreFromTrashIcon,
    label: 'Trash',
    tone: 'bg-gray-50 text-gray-700',
  },
} satisfies Record<
  FileKind,
  { icon: typeof DescriptionOutlinedIcon; label: string; tone: string }
>;

export const formatBytes = (bytes = 0) => {
  if (!bytes) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;

  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
};

export const getInitials = (name: string) => {
  if (!name) {
    return 'User';
  }
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

export const getUploadedTime = (uploadedAt: string | null) => {
  if (!uploadedAt) {
    return 0;
  }

  const time = new Date(uploadedAt).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export const getFileNameSizeClass = (name: string) => {
  if (name.length > 72) {
    return 'text-xs';
  }

  if (name.length > 44) {
    return 'text-[13px]';
  }

  return 'text-sm';
};

export const getContent = (type: DashboardTabId) => {
  const dict: Record<DashboardTabId, { header: string }> = {
    files: {
      header: 'Recent files',
    },
    folders: {
      header: 'Folders',
    },
    storage: {
      header: 'Storage',
    },
    security: {
      header: 'Security',
    },
    starred: {
      header: 'Starred files',
    },
    trash: {
      header: 'Trash Can',
    },
  };
  return dict[type];
};
