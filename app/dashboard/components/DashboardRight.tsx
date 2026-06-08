import { fileFormat, FileKind } from '@/lib/types/types';
import { fileTypeMeta } from '../utils/dashboard.util';

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';

interface DashboardRightProps {
  typeCounts: Record<FileKind, number>;
  filteredFiles: fileFormat[];
}

const DashboardRight = ({ typeCounts, filteredFiles }: DashboardRightProps) => {
  return (
    <aside className="h-full">
      <section className="rounded-lg border border-app surface p-5 shadow-drop-1 h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-app">File mix</h2>
          <GridViewRoundedIcon className="text-accent" fontSize="small" />
        </div>
        <div className="mt-5 space-y-4">
          {(Object.keys(fileTypeMeta) as FileKind[]).slice(0, 5).map((type) => {
            const count = typeCounts[type];
            const percent = filteredFiles.length
              ? Math.round((count / filteredFiles.length) * 100)
              : 0;
            const meta = fileTypeMeta[type];

            return (
              <div key={type}>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="font-medium text-app">{meta.label}</span>
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
    </aside>
  );
};

export default DashboardRight;
