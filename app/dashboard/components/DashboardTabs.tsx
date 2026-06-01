'use client';

import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

type DashboardTab = {
  icon: SvgIconComponent;
  id: DashboardTabId;
  label: string;
};

export type DashboardTabId = 'files' | 'folders' | 'storage' | 'security';

export const dashboardTabs: DashboardTab[] = [
  { id: 'files', label: 'My files', icon: GridViewRoundedIcon },
  { id: 'folders', label: 'Folders', icon: FolderOutlinedIcon },
  { id: 'storage', label: 'Storage', icon: StorageOutlinedIcon },
  { id: 'security', label: 'Security', icon: ShieldOutlinedIcon },
];

export default function DashboardTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: DashboardTabId;
  onTabChange: (tab: DashboardTabId) => void;
}) {
  return (
    <nav className="mt-6 space-y-1 text-sm font-medium">
      {dashboardTabs.map(({ icon: Icon, id, label }) => {
        const isActive = activeTab === id;

        return (
          <button
            aria-pressed={isActive}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition ${
              isActive
                ? 'bg-blue-50 text-blue-700 shadow-drop-1'
                : 'text-muted hover:bg-black/5 hover:text-app'
            }`}
            key={id}
            onClick={() => onTabChange(id)}
            type="button"
          >
            <Icon fontSize="small" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
