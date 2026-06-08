import { fileFormat, FileKind } from '@/lib/types/types';
import { DashboardTabId } from './DashboardTabs';
import {
  fileTypeMeta,
  INITIAL_VISIBLE_FILE_COUNT,
  getContent,
} from '../utils/dashboard.util';

import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import { JSX } from 'react';

interface DashboardActiveTabProp {
  activeTab: DashboardTabId;
  isSearching: boolean;
  isFilteringKind: boolean;
  showAllFiles: boolean;
  visibleFiles: fileFormat[];
  filteredFiles: fileFormat[];
  activeKind: FileKind | 'all';
  hiddenFileCount: number;
  setSearchQuery: (query: string) => void;
  setActiveKind: (activeKind: FileKind | 'all') => void;
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
  setSearchQuery,
  setActiveKind,
  setShowAllFiles,
  renderFileRow,
  handleEmptyBin,
}: DashboardActiveTabProp) => {
  const content = getContent(activeTab);
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

        {activeTab === 'trash' && (
          <div>
            <button
              className="mt-1.5 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white shadow-drop-2 transition hover:-translate-y-0.5"
              //disabled={loadingPlanId !== null}
              onClick={handleEmptyBin}
              type="button"
            >
              Empty Bin
            </button>
          </div>
        )}
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
      {filteredFiles.length > 0 ? (
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
      ) : (
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
              : 'This dashboard is connected to your account and ready for the upload flow when storage actions are added.'}
          </p>
        </div>
      )}
    </section>
  );
};

export default DashboardActiveTab;
