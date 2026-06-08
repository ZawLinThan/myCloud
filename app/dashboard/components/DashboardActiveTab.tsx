import { fileFormat, FileKind } from '@/lib/types/types';
import { DashboardTabId } from './DashboardTabs';
import {
  fileTypeMeta,
  INITIAL_VISIBLE_FILE_COUNT,
  getContent,
  formatBytes,
} from '../utils/dashboard.util';

import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { JSX } from 'react';
import Link from 'next/link';

interface DashboardActiveTabProp {
  activeTab: DashboardTabId;
  isSearching: boolean;
  isFilteringKind: boolean;
  showAllFiles: boolean;
  visibleFiles: fileFormat[];
  filteredFiles: fileFormat[];
  activeKind: FileKind | 'all';
  hiddenFileCount: number;
  folderSummaries: {
    count: number;
    latest: fileFormat;
    size: number;
    type: FileKind;
  }[];
  setActiveKind: (activeKind: FileKind | 'all') => void;
  setActiveTab: (tab: DashboardTabId) => void;
  setShowAllFiles: (showAllFile: boolean) => void;
  renderFileRow: (file: fileFormat, index: number) => JSX.Element;
  handleEmptyBin?: () => void;
}
const DashboardActiveTab = ({
  activeTab,
  isSearching,
  isFilteringKind,
  showAllFiles,
  visibleFiles,
  filteredFiles,
  activeKind,
  hiddenFileCount,
  folderSummaries,
  setActiveKind,
  setActiveTab,
  setShowAllFiles,
  renderFileRow,
  handleEmptyBin,
}: DashboardActiveTabProp) => {
  const content = getContent(activeTab);
  const renderRightButton = () => {
    if (activeTab === 'folders') {
      return <FolderOutlinedIcon className="text-accent" fontSize="small" />;
    } else if (activeTab === 'storage') {
      return (
        <Link
          className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white shadow-drop-2"
          href="/dashboard/subscription"
        >
          Buy storage
        </Link>
      );
    } else if (activeTab === 'trash') {
      return (
        <button
          className="mt-1.5 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white shadow-drop-2 transition hover:-translate-y-0.5"
          onClick={handleEmptyBin}
          type="button"
        >
          Empty Bin
        </button>
      );
    }
  };

  const renderBottonArea = () => {
    if (
      activeTab == 'files' ||
      activeTab === 'starred' ||
      activeTab === 'trash'
    ) {
      if (filteredFiles.length > 0) {
        return (
          <>
            <div className="min-w-0 divide-y divide-[var(--border)]">
              {visibleFiles.map((file, index) => renderFileRow(file, index))}
            </div>
            {filteredFiles.length > INITIAL_VISIBLE_FILE_COUNT && (
              <div className="border-t border-app px-5 py-4">
                <button
                  className="flex h-10 w-full items-center justify-center rounded-md border border-app surface px-4 text-sm font-semibold text-accent transition hover:bg-black/5"
                  onClick={() => setShowAllFiles(!showAllFiles)}
                  type="button"
                >
                  {showAllFiles ? 'Show fewer' : `More (${hiddenFileCount})`}
                </button>
              </div>
            )}
          </>
        );
      } else {
        return (
          <div className="px-5 py-12 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-[var(--surface-soft)] text-accent">
              <CloudDoneOutlinedIcon fontSize="medium" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-app">
              {isSearching || isFilteringKind
                ? 'No matching files'
                : `No files ${activeTab === 'files' ? 'uploaded' : ''} yet`}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              {isSearching || isFilteringKind
                ? 'Try a different search or clear the type filter.'
                : ''}
            </p>
          </div>
        );
      }
    } else if (activeTab === 'folders') {
      return (
        <div className=" grid min-w-0 gap-5 sm:grid-cols-2 p-5">
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
      );
    }
  };

  return (
    <section className="min-w-0 rounded-lg border border-app surface shadow-drop-1">
      <div className="flex min-w-0 items-start justify-between gap-4 border-b border-app px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-app">{content.header}</h2>
          <p className="mt-1 truncate text-sm text-muted">
            {isSearching || isFilteringKind
              ? `Showing ${visibleFiles.length} of ${filteredFiles.length} matching file${filteredFiles.length === 1 ? '' : 's'}`
              : `Showing ${visibleFiles.length} of ${filteredFiles.length} ${activeTab === 'files' ? 'latest upload' : 'file'}${filteredFiles.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {renderRightButton()}
      </div>

      {activeTab === 'files' && (
        <div className="flex gap-2 overflow-x-auto border-b border-app px-5 py-3">
          {(['all', ...Object.keys(fileTypeMeta)] as (FileKind | 'all')[])
            .slice(0, 6)
            .map((type) => {
              const isActive = activeKind === type;
              const label =
                type === 'all' ? 'All' : fileTypeMeta[type as FileKind].label;

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
      )}

      {renderBottonArea()}
    </section>
  );
};

export default DashboardActiveTab;
