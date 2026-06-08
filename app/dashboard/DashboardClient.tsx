'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';

import Link from 'next/link';
import { toast } from 'sonner';

import { CurrentUser, fileFormat, FileKind } from '../../lib/types/types';
import DashboardTabs, { DashboardTabId } from './components/DashboardTabs';
import SignOutButton from './components/SignOutButton';
import UploadButton from './components/UploadButton';
import {
  deleteUploadedFile,
  getFiles,
  restoreFile,
  toggleFileStarred,
} from '@/lib/actions/file.actions';
import { useEffect, useMemo, useState } from 'react';
import FileDropDownMenu from './components/DropDownMenu/FileDropDownMenu';
import FilterDropDownMenu from './components/DropDownMenu/FilterDropDownMenu';
import DashboardRight from './components/DashboardRight';
import {
  INITIAL_VISIBLE_FILE_COUNT,
  fileTypeMeta,
  formatBytes,
  getInitials,
  getUploadedTime,
  getFileNameSizeClass,
} from './utils/dashboard.util';
import DashboardActiveTab from './components/DashboardActiveTab';

type SortMode = 'recent' | 'name' | 'size';

const sortLabels: Record<SortMode, string> = {
  recent: 'Recent',
  name: 'Name',
  size: 'Size',
};

export default function DashboardClientPage({ user }: { user: CurrentUser }) {
  const storageLimitBytes = user.storageLimitBytes;
  const [files, setFiles] = useState<fileFormat[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTabId>('files');
  const [activeKind, setActiveKind] = useState<FileKind | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [openFileMenuKey, setOpenFileMenuKey] = useState<string | null>(null);
  const [deletingFileKey, setDeletingFileKey] = useState<string | null>(null);
  const [totalBytes, setTotalBytes] = useState(0);
  const [usage, setUsage] = useState(0);
  const [usedPercent, setUsePercent] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const fetchFiles = async () => {
    const result = await getFiles(user.accountId);
    if (!result.success) return;

    const fetchedFiles = Array.isArray(result.files) ? result.files : [];
    const total = fetchedFiles.reduce((sum, file) => sum + (file.size ?? 0), 0);
    const percent = Math.min(
      Math.round((total / storageLimitBytes) * 100),
      100
    );

    setFiles(fetchedFiles);
    setTotalBytes(total);
    setUsage(total);
    setUsePercent(percent);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      const result = await getFiles(user.accountId);
      if (!result.success) return;

      const fetchedFiles = Array.isArray(result.files) ? result.files : [];
      let total = 0;
      if (activeKind === 'starred') {
        const filteredFiles = fetchedFiles.filter(
          (file: fileFormat) => file.starred === true
        );
        total = filteredFiles.reduce((sum, file) => sum + (file.size ?? 0), 0);
      } else if (activeKind === 'trash') {
        const filteredFiles = fetchedFiles.filter(
          (file: fileFormat) => file.trash === true
        );
        total = filteredFiles.reduce((sum, file) => sum + (file.size ?? 0), 0);
      } else {
        total = fetchedFiles.reduce((sum, file) => sum + (file.size ?? 0), 0);
      }
      const usage = fetchedFiles.reduce(
        (sum, file) => sum + (file.size ?? 0),
        0
      );
      const percent = Math.min(
        Math.round((usage / storageLimitBytes) * 100),
        100
      );

      setFiles(fetchedFiles);
      setTotalBytes(total);
      setUsage(usage);
      setUsePercent(percent);
    };

    void fetchFiles();
  }, [storageLimitBytes, user.accountId, activeKind]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredFiles = useMemo(() => {
    const matchingFiles = files.filter((file) => {
      const matchesSearch = () => {
        if (!normalizedSearchQuery) return true;
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
      };
      if (activeKind !== 'trash' && activeKind !== 'starred') {
        if (file.trash === true) return false;
      }
      if (activeKind === 'starred')
        return file.starred === true && matchesSearch();
      if (activeKind === 'trash') return file.trash === true && matchesSearch();

      if (activeKind !== 'all' && file.type !== activeKind) return false;

      return matchesSearch();
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
  const isFilteringKind =
    activeKind === 'audio' ||
    activeKind === 'document' ||
    activeKind === 'video' ||
    activeKind === 'image' ||
    activeKind === 'other';
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
    {
      audio: 0,
      document: 0,
      image: 0,
      other: 0,
      video: 0,
      starred: 0,
      trash: 0,
    }
  );

  const folderSummaries = (Object.keys(fileTypeMeta) as FileKind[]).map(
    (type) => {
      let typeFiles: fileFormat[] = [];
      if (type === 'starred') {
        typeFiles = files.filter((file) => file.starred === true);
      } else if (type === 'trash') {
        typeFiles = files.filter((file) => file.trash === true);
      } else {
        typeFiles = files.filter((file) => file.type === type);
      }
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

  const SortFiles = (type: SortMode) => {
    setSortMode(type);
    setShowAllFiles(false);
    setSortMenuOpen(false);
  };

  const handleShareFile = async (file: fileFormat, method: string) => {
    if (method === 'copy') {
      try {
        await navigator.clipboard.writeText(file.url);
        toast.success('Share link copied');
      } catch {
        toast.error('Unable to copy share link');
      } finally {
        setOpenFileMenuKey(null);
      }
    } else if (method === 'email') {
      console.log('Sharing files');
      // const result = await shareFileViaEmail(
      //   user.accountId,
      //   file,
      //   'zawlinthan2005@gmail.com'
      // );

      // if (result.success) {
      //   toast.success('File shared successfully!');
      // } else {
      //   toast.error(`Failed to share file: ${result.message}`);
      // }
      toast.success('File sharing via email is coming soon!');
      setOpenFileMenuKey(null);
    }
  };

  const handleFileStarred = async (file: fileFormat) => {
    try {
      await toast.promise(
        toggleFileStarred({ key: file.key, uid: user.accountId }),
        {
          loading: file.starred ? 'Unstarring file...' : 'Starring file...',
          success: file.starred ? 'File Unstarred' : 'File Starred',
          error: 'Unable to update file protection',
        }
      );
      await fetchFiles();
    } finally {
    }
  };

  const handleDeleteFile = async (file: fileFormat) => {
    const shouldDelete = window.confirm(`Move "${file.name}" to the bin?`);

    if (!shouldDelete) {
      return;
    }

    setDeletingFileKey(file.key);

    try {
      await toast.promise(
        deleteUploadedFile({
          key: file.key,
          uid: user.accountId,
          type: 'single',
        }),
        {
          loading: `Deleting ${file.name}...`,
          success: file.trash
            ? `${file.name} deleted successfully`
            : `${file.name} put to trash successfully`,
          error: `Failed to delete ${file.name}`,
        }
      );
      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.key !== file.key)
      );
      await fetchFiles();
    } finally {
      setDeletingFileKey(null);
      setOpenFileMenuKey(null);
    }
  };

  const handleEmptyBin = async () => {
    const shouldDelete = window.confirm(`Empty Trash Bin?`);

    if (!shouldDelete) {
      return;
    }
    await toast.promise(
      deleteUploadedFile({ uid: user.accountId, type: 'all' }),
      {
        loading: `Emptying Trash Bin.`,
        success: 'Bin successfully emptied',
        error: `Failed to empty the bin`,
      }
    );
    await fetchFiles();
  };

  const handleRestoreFile = async (file: fileFormat) => {
    await toast.promise(restoreFile(user.accountId, file.key), {
      loading: `Restoring ${file.name}`,
      success: `${file.name} restored successfully`,
      error: `Failed to restore ${file.name}`,
    });
    await fetchFiles();
  };

  const renderFileRow = (file: fileFormat, index: number) => {
    const meta = fileTypeMeta[file.type] ?? fileTypeMeta.other;
    const Icon = meta.icon;
    const getFileUrl = (url: string, fileType: string) => {
      if (['document', 'spreadsheet', 'presentation'].includes(fileType)) {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      }
      return url; // images, pdf, video preview directly
    };
    return (
      <div
        key={file.key}
        className="flex min-w-0 max-w-full items-center justify-between gap-3 px-5 py-4 transition hover:bg-black/[0.03]"
      >
        <a
          className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden"
          href={getFileUrl(file.url, file.extension ?? file.type)}
          rel="noreferrer"
          target="_blank"
          title={file.name}
        >
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
        </a>
        {file.starred && (
          <StarBorderIcon className="text-muted" fontSize="small" />
        )}
        <div className="relative shrink-0">
          <button
            aria-expanded={openFileMenuKey === file.key}
            aria-label={`Open actions for ${file.name}`}
            className="grid h-9 w-9 place-items-center rounded-md text-muted transition hover:bg-black/5 hover:text-app"
            onClick={() =>
              setOpenFileMenuKey((currentKey) =>
                currentKey === file.key ? null : file.key
              )
            }
            type="button"
          >
            <MoreHorizRoundedIcon fontSize="small" />
          </button>
          {openFileMenuKey === file.key && (
            <FileDropDownMenu
              trash={file.trash}
              isDeleting={deletingFileKey === file.key}
              onClose={() => setOpenFileMenuKey(null)}
              onDelete={() => void handleDeleteFile(file)}
              onRestore={() => void handleRestoreFile(file)}
              onShare={(method: string) => void handleShareFile(file, method)}
              onToggleProtection={() => void handleFileStarred(file)}
              index={index}
            />
          )}
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    if (activeTab === 'folders') {
      return (
        <section className="min-w-0 rounded-lg border border-app surface p-5 shadow-drop-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-app">Folders</h2>
              <p className="mt-1 text-sm text-muted">
                Smart folders grouped by file type
              </p>
            </div>
            <FolderOutlinedIcon className="text-accent" fontSize="small" />
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
                    if (type === 'starred') {
                      setActiveTab('starred');
                    } else if (type === 'trash') {
                      setActiveTab('trash');
                    } else {
                      setActiveTab('files');
                    }
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
      );
    } else if (activeTab === 'storage') {
      return (
        <section className="min-w-0 rounded-lg border border-app surface p-5 shadow-drop-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-app">Storage</h2>
              <p className="mt-1 text-sm text-muted">
                {formatBytes(totalBytes)} used of{' '}
                {formatBytes(storageLimitBytes)}
              </p>
            </div>
            <Link
              className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white shadow-drop-2"
              href="/dashboard/subscription"
            >
              Buy storage
            </Link>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${usedPercent}%` }}
            />
          </div>

          <div className="mt-5 divide-y divide-[var(--border)]">
            {folderSummaries.slice(0, 5).map(({ size, type }) => {
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
                    {formatBytes(size)} · {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      );
    } else {
      return (
        <DashboardActiveTab
          activeTab={activeTab}
          isSearching={isSearching}
          isFilteringKind={isFilteringKind}
          showAllFiles={showAllFiles}
          visibleFiles={visibleFiles}
          filteredFiles={filteredFiles}
          activeKind={activeKind}
          hiddenFileCount={hiddenFileCount}
          folderSummaries={folderSummaries}
          setActiveKind={setActiveKind}
          setActiveTab={setActiveTab}
          setShowAllFiles={setShowAllFiles}
          renderFileRow={renderFileRow}
          handleEmptyBin={handleEmptyBin}
        />
      );
    }
  };
  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-7rem)] rounded-lg border border-app surface p-4 shadow-drop-1 lg:block">
          <a
            className="flex items-center gap-3 rounded-md bg-[var(--surface-soft)] p-3"
            href="/dashboard"
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
          </a>

          <DashboardTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            changeActiveKind={setActiveKind}
          />

          <div className="mt-8 rounded-md border border-app bg-[var(--surface-soft)] p-4">
            <div className="flex items-center justify-between">
              <StorageOutlinedIcon className="text-accent" fontSize="small" />
              <span className="text-xs font-semibold text-muted">
                {usedPercent}%
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-app">Storage</p>
            <p className="mt-1 text-xs text-muted">
              {formatBytes(usage)} of {formatBytes(storageLimitBytes)}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <Link
              className="mt-3 block text-xs font-semibold text-accent"
              href="/dashboard/subscription"
            >
              Buy more storage
            </Link>
          </div>

          <UploadButton
            uid={user.accountId}
            onUploadComplete={fetchFiles}
            total={totalBytes}
            limit={storageLimitBytes}
          />
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close navigation menu"
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileNavOpen(false)}
              type="button"
            />
            <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto border-r border-app surface p-4 shadow-drop-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted">Menu</span>
                <button
                  aria-label="Close menu"
                  className="grid h-9 w-9 place-items-center rounded-md text-muted transition hover:bg-black/5 hover:text-app"
                  onClick={() => setMobileNavOpen(false)}
                  type="button"
                >
                  <CloseRoundedIcon fontSize="small" />
                </button>
              </div>
              <a
                className="flex items-center gap-3 rounded-md bg-[var(--surface-soft)] p-3"
                href="/dashboard"
                onClick={() => setMobileNavOpen(false)}
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
              </a>

              <DashboardTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                changeActiveKind={setActiveKind}
              />

              <div className="rounded-md border border-app bg-[var(--surface-soft)] p-4">
                <div className="flex items-center justify-between">
                  <StorageOutlinedIcon
                    className="text-accent"
                    fontSize="small"
                  />
                  <span className="text-xs font-semibold text-muted">
                    {usedPercent}%
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-app">Storage</p>
                <p className="mt-1 text-xs text-muted">
                  {formatBytes(totalBytes)} of {formatBytes(storageLimitBytes)}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
                <Link
                  className="mt-3 block text-xs font-semibold text-accent"
                  href="/dashboard/subscription"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Buy more storage
                </Link>
              </div>

              <UploadButton
                uid={user.accountId}
                onUploadComplete={fetchFiles}
                total={totalBytes}
                limit={storageLimitBytes}
              />
            </aside>
          </div>
        )}

        <section className="min-w-0">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <button
                aria-label="Open navigation menu"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-app surface text-muted transition hover:bg-black/5 hover:text-app lg:hidden"
                onClick={() => setMobileNavOpen(true)}
                type="button"
              >
                <MenuRoundedIcon fontSize="small" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-accent">
                  Workspace dashboard
                </p>
                <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight text-app sm:text-4xl">
                  Welcome back, {user.fullName && user.fullName.split(' ')[0]}.
                </h1>
              </div>
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
                onClick={() => {
                  setSortMenuOpen((open) => !open);
                }}
                type="button"
              >
                <SortRoundedIcon fontSize="small" />
                <span className="hidden sm:inline">{sortLabels[sortMode]}</span>
              </button>
              {sortMenuOpen && <FilterDropDownMenu sortFunction={SortFiles} />}
              <SignOutButton />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            {[
              [
                isSearching ? 'Matching files' : 'Total files',
                filteredFiles.length.toString(),
                InsertDriveFileOutlinedIcon,
              ],
              ['Storage used', formatBytes(totalBytes), StorageOutlinedIcon],
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
            {renderActiveTab()}
            <DashboardRight
              typeCounts={typeCounts}
              filteredFiles={filteredFiles}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
