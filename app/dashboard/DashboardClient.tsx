'use client';

import Link from 'next/link';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
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

import { CurrentUser, fileFormat, FileKind } from '../../lib/types/types';
import DashboardTabs, {
  DashboardTabId,
  dashboardTabs,
} from './components/DashboardTabs';
import SignOutButton from './components/SignOutButton';
import UploadButton from './components/UploadButton';
import { getFiles } from '@/lib/actions/file.actions';
import { useEffect, useMemo, useState } from 'react';

const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024; // 1GB
const INITIAL_VISIBLE_FILE_COUNT = 5;

type SortMode = 'recent' | 'name' | 'size';

const sortLabels: Record<SortMode, string> = {
  recent: 'Recent',
  name: 'Name',
  size: 'Size',
};

const sortOrder: SortMode[] = ['recent', 'name', 'size'];

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

const getInitials = (name: string) => {
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

const getUploadedTime = (uploadedAt: string | null) => {
  if (!uploadedAt) {
    return 0;
  }

  const time = new Date(uploadedAt).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const getFileNameSizeClass = (name: string) => {
  if (name.length > 72) {
    return 'text-xs';
  }

  if (name.length > 44) {
    return 'text-[13px]';
  }

  return 'text-sm';
};

export default function DashboardClientPage({ user }: { user: CurrentUser }) {
  const [files, setFiles] = useState<fileFormat[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTabId>('files');
  const [activeKind, setActiveKind] = useState<FileKind | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [totalBytes, setTotalBytes] = useState(0);
  const [usedPercent, setUsePercent] = useState(0);

  const fetchFiles = async () => {
    const result = await getFiles(user.accountId);
    if (!result.success) return;

    const fetchedFiles = Array.isArray(result.files) ? result.files : [];
    const total = fetchedFiles.reduce((sum, file) => sum + (file.size ?? 0), 0);
    const percent = Math.min(
      Math.round((total / STORAGE_LIMIT_BYTES) * 100),
      100
    );

    setFiles(fetchedFiles);
    setTotalBytes(total);
    setUsePercent(percent);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      const result = await getFiles(user.accountId);
      if (!result.success) return;

      const fetchedFiles = Array.isArray(result.files) ? result.files : [];
      const total = fetchedFiles.reduce(
        (sum, file) => sum + (file.size ?? 0),
        0
      );
      const percent = Math.min(
        Math.round((total / STORAGE_LIMIT_BYTES) * 100),
        100
      );

      setFiles(fetchedFiles);
      setTotalBytes(total);
      setUsePercent(percent);
    };

    void fetchFiles();
  }, [user.accountId]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredFiles = useMemo(() => {
    const matchingFiles = files.filter((file) => {
      if (activeKind !== 'all' && file.type !== activeKind) {
        return false;
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      const searchableText = [
        file.name,
        file.type,
        file.extension,
        formatBytes(file.size),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearchQuery);
    });

    return [...matchingFiles].sort((a, b) => {
      if (sortMode === 'name') {
        return a.name.localeCompare(b.name);
      }

      if (sortMode === 'size') {
        return (b.size ?? 0) - (a.size ?? 0);
      }

      return getUploadedTime(b.uploadedAt) - getUploadedTime(a.uploadedAt);
    });
  }, [activeKind, files, normalizedSearchQuery, sortMode]);
  const isSearching = normalizedSearchQuery.length > 0;
  const isFilteringKind = activeKind !== 'all';
  const visibleFiles = showAllFiles
    ? filteredFiles
    : filteredFiles.slice(0, INITIAL_VISIBLE_FILE_COUNT);
  const hiddenFileCount = Math.max(
    filteredFiles.length - visibleFiles.length,
    0
  );

  const typeCounts = filteredFiles.reduce<Record<FileKind, number>>(
    (counts, file) => {
      counts[file.type] += 1;
      return counts;
    },
    { audio: 0, document: 0, image: 0, other: 0, video: 0 }
  );

  const folderSummaries = (Object.keys(fileTypeMeta) as FileKind[]).map(
    (type) => {
      const typeFiles = files.filter((file) => file.type === type);
      const total = typeFiles.reduce((sum, file) => sum + (file.size ?? 0), 0);
      const latest = typeFiles.reduce(
        (latestFile, file) =>
          getUploadedTime(file.uploadedAt) >
          getUploadedTime(latestFile?.uploadedAt ?? null)
            ? file
            : latestFile,
        typeFiles[0]
      );

      return {
        count: typeFiles.length,
        latest,
        size: total,
        type,
      };
    }
  );

  const cycleSortMode = () => {
    const currentIndex = sortOrder.indexOf(sortMode);
    const nextIndex = (currentIndex + 1) % sortOrder.length;
    setSortMode(sortOrder[nextIndex]);
    setShowAllFiles(false);
  };

  const renderFileRow = (file: fileFormat) => {
    const meta = fileTypeMeta[file.type] ?? fileTypeMeta.other;
    const Icon = meta.icon;
    const getFileUrl = (url: string, fileType: string) => {
      if (['document', 'spreadsheet', 'presentation'].includes(fileType)) {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      }
      return url; // images, pdf, video preview directly
    };
    return (
      <Link
        className="flex min-w-0 max-w-full items-center justify-between gap-3 px-5 py-4 transition hover:bg-black/[0.03]"
        href={getFileUrl(file.url, file.extension ?? file.type)}
        key={file.key}
        title={file.name}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${meta.tone}`}
          >
            <Icon fontSize="small" />
          </span>
          <span className="min-w-0 flex-1 overflow-hidden">
            <span
              className={`block max-w-full truncate font-semibold leading-5 text-app ${getFileNameSizeClass(file.name)}`}
            >
              {file.name}
            </span>
            <span className="block max-w-full truncate text-sm text-muted">
              {meta.label}
              {file.extension ? ` · ${file.extension}` : ''} ·{' '}
              {formatBytes(file.size)}
            </span>
          </span>
        </div>
        <MoreHorizRoundedIcon
          className="shrink-0 text-muted"
          fontSize="small"
        />
      </Link>
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
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

          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

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

          <UploadButton
            uid={user.accountId}
            onUploadComplete={fetchFiles}
            total={totalBytes}
            limit={STORAGE_LIMIT_BYTES}
          />
        </aside>

        <section className="min-w-0">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-accent">
                Workspace dashboard
              </p>
              <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-app sm:text-4xl">
                Welcome back, {user.fullName && user.fullName.split(' ')[0]}.
              </h1>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-app surface px-3 text-muted transition focus-within:border-[var(--accent)] focus-within:text-app md:w-72 md:flex-none">
                <SearchRoundedIcon className="shrink-0" fontSize="small" />
                <span className="sr-only">Search files</span>
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-app outline-none placeholder:text-muted"
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setShowAllFiles(false);
                  }}
                  placeholder="Search files"
                  type="search"
                  value={searchQuery}
                />
              </label>
              <button
                aria-label={`Sort files by ${sortLabels[sortMode]}`}
                className="flex h-10 items-center gap-2 rounded-md border border-app surface px-3 text-sm font-semibold text-muted transition hover:bg-black/5 hover:text-app"
                onClick={cycleSortMode}
                type="button"
              >
                <SortRoundedIcon fontSize="small" />
                <span className="hidden sm:inline">{sortLabels[sortMode]}</span>
              </button>
              <SignOutButton />
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {dashboardTabs.map(({ icon: Icon, id, label }) => {
              const isActive = activeTab === id;

              return (
                <button
                  aria-pressed={isActive}
                  className={`flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                    isActive
                      ? 'border-transparent bg-accent text-white'
                      : 'border-app surface text-muted hover:bg-black/5 hover:text-app'
                  }`}
                  key={id}
                  onClick={() => setActiveTab(id)}
                  type="button"
                >
                  <Icon fontSize="small" />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [
                isSearching ? 'Matching files' : 'Total files',
                filteredFiles.length.toString(),
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

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            {activeTab === 'files' && (
              <section className="min-w-0 rounded-lg border border-app surface shadow-drop-1">
                <div className="flex min-w-0 items-start justify-between gap-4 border-b border-app px-5 py-4">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-app">
                      Recent files
                    </h2>
                    <p className="mt-1 truncate text-sm text-muted">
                      {isSearching || isFilteringKind
                        ? `Showing ${visibleFiles.length} of ${filteredFiles.length} matching file${filteredFiles.length === 1 ? '' : 's'}`
                        : `Showing ${visibleFiles.length} of ${filteredFiles.length} latest upload${filteredFiles.length === 1 ? '' : 's'}`}
                    </p>
                  </div>
                  {(isSearching || isFilteringKind) && (
                    <button
                      aria-label="Clear file filters"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted hover:bg-black/5 hover:text-app"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveKind('all');
                        setShowAllFiles(false);
                      }}
                      type="button"
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto border-b border-app px-5 py-3">
                  {(
                    ['all', ...Object.keys(fileTypeMeta)] as (
                      | FileKind
                      | 'all'
                    )[]
                  ).map((type) => {
                    const isActive = activeKind === type;
                    const label =
                      type === 'all'
                        ? 'All'
                        : fileTypeMeta[type as FileKind].label;

                    return (
                      <button
                        className={`h-9 shrink-0 rounded-md border px-3 text-sm font-semibold transition ${
                          isActive
                            ? 'border-transparent bg-accent text-white'
                            : 'border-app surface text-muted hover:bg-black/5 hover:text-app'
                        }`}
                        key={type}
                        onClick={() => {
                          setActiveKind(type);
                          setShowAllFiles(false);
                        }}
                        type="button"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {filteredFiles.length > 0 ? (
                  <>
                    <div className="min-w-0 divide-y divide-[var(--border)] overflow-hidden">
                      {visibleFiles.map(renderFileRow)}
                    </div>
                    {filteredFiles.length > INITIAL_VISIBLE_FILE_COUNT && (
                      <div className="border-t border-app px-5 py-4">
                        <button
                          className="flex h-10 w-full items-center justify-center rounded-md border border-app surface px-4 text-sm font-semibold text-accent transition hover:bg-black/5"
                          onClick={() => setShowAllFiles((current) => !current)}
                          type="button"
                        >
                          {showAllFiles
                            ? 'Show fewer'
                            : `More (${hiddenFileCount})`}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-5 py-12 text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-[var(--surface-soft)] text-accent">
                      <CloudDoneOutlinedIcon fontSize="medium" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-app">
                      {isSearching || isFilteringKind
                        ? 'No matching files'
                        : 'No files uploaded yet'}
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                      {isSearching || isFilteringKind
                        ? 'Try a different search or clear the type filter.'
                        : 'This dashboard is connected to your account and ready for the upload flow when storage actions are added.'}
                    </p>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'folders' && (
              <section className="min-w-0 rounded-lg border border-app surface p-5 shadow-drop-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-app">
                      Folders
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Smart folders grouped by file type
                    </p>
                  </div>
                  <FolderOutlinedIcon
                    className="text-accent"
                    fontSize="small"
                  />
                </div>

                <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
                  {folderSummaries.map(({ count, latest, size, type }) => {
                    const meta = fileTypeMeta[type];
                    const Icon = meta.icon;

                    return (
                      <button
                        className="min-w-0 rounded-lg border border-app bg-[var(--surface-soft)] p-4 text-left transition hover:border-[var(--accent)]"
                        key={type}
                        onClick={() => {
                          setActiveKind(type);
                          setActiveTab('files');
                          setShowAllFiles(false);
                        }}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${meta.tone}`}
                          >
                            <Icon fontSize="small" />
                          </span>
                          <span className="text-sm font-semibold text-muted">
                            {count}
                          </span>
                        </div>
                        <h3 className="mt-5 truncate text-sm font-semibold text-app">
                          {meta.label}
                        </h3>
                        <p className="mt-1 truncate text-sm text-muted">
                          {formatBytes(size)}
                          {latest ? ` · Latest: ${latest.name}` : ''}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {activeTab === 'storage' && (
              <section className="min-w-0 rounded-lg border border-app surface p-5 shadow-drop-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-app">
                      Storage
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {formatBytes(totalBytes)} used of{' '}
                      {formatBytes(STORAGE_LIMIT_BYTES)}
                    </p>
                  </div>
                  <StorageOutlinedIcon
                    className="text-accent"
                    fontSize="small"
                  />
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>

                <div className="mt-5 divide-y divide-[var(--border)]">
                  {folderSummaries.map(({ count, size, type }) => {
                    const meta = fileTypeMeta[type];
                    const percent = totalBytes
                      ? Math.round((size / totalBytes) * 100)
                      : 0;

                    return (
                      <div
                        className="flex min-w-0 items-center justify-between gap-4 py-3"
                        key={type}
                      >
                        <span className="min-w-0 truncate text-sm font-medium text-app">
                          {meta.label}
                        </span>
                        <span className="shrink-0 text-sm text-muted">
                          {formatBytes(size)} · {count} · {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {activeTab === 'security' && (
              <section className="min-w-0 rounded-lg border border-app surface p-5 shadow-drop-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                  <ShieldOutlinedIcon fontSize="small" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-app">
                  Account protected
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Dashboard data is only rendered after the signed session is
                  verified on the server. File links open directly from the
                  stored R2 URL, and uploaded files remain scoped to this
                  account.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Session check', 'Enabled'],
                    ['Protected links', '0 active'],
                    ['Workspace access', user.email ?? 'Signed in'],
                  ].map(([label, value]) => (
                    <div
                      className="min-w-0 rounded-md border border-app bg-[var(--surface-soft)] p-4"
                      key={label}
                    >
                      <p className="text-sm font-medium text-muted">{label}</p>
                      <p className="mt-2 truncate text-sm font-semibold text-app">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
                    const percent = filteredFiles.length
                      ? Math.round((count / filteredFiles.length) * 100)
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
