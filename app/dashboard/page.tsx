import Link from 'next/link';
import { redirect } from 'next/navigation';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';

import File from '@/models/file.model';
import { connectDB } from '@/lib/mongoDB/db';
import { getCurrentUser } from '@/lib/utils/session';
import SignOutButton from './components/SignOutButton';

type FileKind = 'document' | 'image' | 'video' | 'audio' | 'other';

type DashboardFile = {
  _id: {
    toString: () => string;
  };
  extension?: string;
  file: FileKind;
  name: string;
  size?: number;
  url: string;
};

const STORAGE_LIMIT_BYTES = 100 * 1024 * 1024 * 1024;

const fileTypeMeta = {
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
} satisfies Record<
  FileKind,
  { icon: typeof DescriptionOutlinedIcon; label: string; tone: string }
>;

const formatBytes = (bytes = 0) => {
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

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const getDashboardFiles = async (accountId: string) => {
  await connectDB();

  const files = await File.find({ accountId })
    .sort({ _id: -1 })
    .limit(12)
    .lean<DashboardFile[]>();

  return files;
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const files = await getDashboardFiles(user.accountId);
  const totalBytes = files.reduce((sum, file) => sum + (file.size ?? 0), 0);
  const usedPercent = Math.min(
    Math.round((totalBytes / STORAGE_LIMIT_BYTES) * 100),
    100
  );
  const typeCounts = files.reduce<Record<FileKind, number>>(
    (counts, file) => {
      counts[file.file] += 1;
      return counts;
    },
    { audio: 0, document: 0, image: 0, other: 0, video: 0 }
  );

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[248px_1fr]">
        <aside className="hidden min-h-[calc(100vh-7rem)] rounded-lg border border-app surface p-4 shadow-drop-1 lg:block">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md bg-[var(--surface-soft)] p-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-md bg-accent text-sm font-semibold text-white">
              {getInitials(user.fullName)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-app">
                {user.fullName}
              </span>
              <span className="block truncate text-xs text-muted">
                {user.email}
              </span>
            </span>
          </Link>

          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white shadow-drop-2 transition hover:-translate-y-0.5">
            <AddRoundedIcon fontSize="small" />
            Upload files
          </button>

          <nav className="mt-6 space-y-1 text-sm font-medium">
            {[
              ['My files', GridViewRoundedIcon],
              ['Folders', FolderOutlinedIcon],
              ['Storage', StorageOutlinedIcon],
              ['Security', ShieldOutlinedIcon],
            ].map(([item, Icon], index) => (
              <Link
                key={item as string}
                href="/dashboard"
                className={`flex items-center gap-3 rounded-md px-3 py-2 transition ${
                  index === 0
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-muted hover:bg-black/5 hover:text-app'
                }`}
              >
                <Icon fontSize="small" />
                {item as string}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-md border border-app bg-[var(--surface-soft)] p-4">
            <div className="flex items-center justify-between">
              <StorageOutlinedIcon className="text-accent" fontSize="small" />
              <span className="text-xs font-semibold text-muted">
                {usedPercent}%
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-app">Storage</p>
            <p className="mt-1 text-xs text-muted">
              {formatBytes(totalBytes)} of {formatBytes(STORAGE_LIMIT_BYTES)}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-accent">
                Workspace dashboard
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-app sm:text-4xl">
                Welcome back, {user.fullName.split(' ')[0]}.
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Search files"
                className="grid h-10 w-10 place-items-center rounded-md border border-app surface text-muted transition hover:bg-black/5 hover:text-app"
              >
                <SearchRoundedIcon fontSize="small" />
              </button>
              <button
                aria-label="Sort files"
                className="grid h-10 w-10 place-items-center rounded-md border border-app surface text-muted transition hover:bg-black/5 hover:text-app"
              >
                <SortRoundedIcon fontSize="small" />
              </button>
              <SignOutButton />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [
                'Total files',
                files.length.toString(),
                InsertDriveFileOutlinedIcon,
              ],
              ['Storage used', formatBytes(totalBytes), StorageOutlinedIcon],
              ['Protected links', '0 active', ShieldOutlinedIcon],
              ['Sync status', 'Healthy', CloudDoneOutlinedIcon],
            ].map(([label, value, Icon]) => (
              <article
                className="rounded-lg border border-app surface p-5 shadow-drop-1"
                key={label as string}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-muted">
                    {label as string}
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-[var(--surface-soft)] text-accent">
                    <Icon fontSize="small" />
                  </span>
                </div>
                <p className="mt-4 text-2xl font-semibold text-app">
                  {value as string}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
            <section className="rounded-lg border border-app surface shadow-drop-1">
              <div className="flex items-center justify-between border-b border-app px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-app">
                    Recent files
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Latest uploads in this workspace
                  </p>
                </div>
                <button className="grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-black/5 hover:text-app">
                  <MoreHorizRoundedIcon fontSize="small" />
                </button>
              </div>

              {files.length > 0 ? (
                <div className="divide-y divide-[var(--border)]">
                  {files.map((file) => {
                    const meta = fileTypeMeta[file.file] ?? fileTypeMeta.other;
                    const Icon = meta.icon;

                    return (
                      <Link
                        className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-black/[0.03]"
                        href={file.url}
                        key={file._id.toString()}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${meta.tone}`}
                          >
                            <Icon fontSize="small" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-app">
                              {file.name}
                            </span>
                            <span className="block text-sm text-muted">
                              {meta.label}
                              {file.extension
                                ? ` · ${file.extension}`
                                : ''} · {formatBytes(file.size)}
                            </span>
                          </span>
                        </div>
                        <MoreHorizRoundedIcon
                          className="shrink-0 text-muted"
                          fontSize="small"
                        />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-[var(--surface-soft)] text-accent">
                    <CloudDoneOutlinedIcon fontSize="medium" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-app">
                    No files uploaded yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                    This dashboard is connected to your account and ready for
                    the upload flow when storage actions are added.
                  </p>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <section className="rounded-lg border border-app surface p-5 shadow-drop-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-app">File mix</h2>
                  <GridViewRoundedIcon
                    className="text-accent"
                    fontSize="small"
                  />
                </div>
                <div className="mt-5 space-y-4">
                  {(Object.keys(fileTypeMeta) as FileKind[]).map((type) => {
                    const count = typeCounts[type];
                    const percent = files.length
                      ? Math.round((count / files.length) * 100)
                      : 0;
                    const meta = fileTypeMeta[type];

                    return (
                      <div key={type}>
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="font-medium text-app">
                            {meta.label}
                          </span>
                          <span className="text-muted">{count}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg border border-app surface p-5 shadow-drop-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                  <ShieldOutlinedIcon fontSize="small" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-app">
                  Account protected
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This route verifies the signed session cookie on the server
                  before any workspace data is shown.
                </p>
              </section>
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}
