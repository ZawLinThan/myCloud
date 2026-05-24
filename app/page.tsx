import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';

const folders = [
  { name: 'Design assets', files: '128 files', color: 'bg-blue-500' },
  { name: 'Client uploads', files: '42 files', color: 'bg-emerald-500' },
  { name: 'Contracts', files: '18 files', color: 'bg-amber-500' },
];

const files = [
  {
    name: 'Brand guidelines.pdf',
    meta: 'PDF · 12.4 MB',
    icon: DescriptionOutlinedIcon,
  },
  {
    name: 'Homepage concept.png',
    meta: 'Image · 8.1 MB',
    icon: ImageOutlinedIcon,
  },
  {
    name: 'Launch walkthrough.mp4',
    meta: 'Video · 84 MB',
    icon: PlayCircleOutlineRoundedIcon,
  },
];

export default function Home() {
  return (
    <main className="app-shell min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_1fr_320px]">
        <aside className="hidden rounded-lg border border-app surface p-4 shadow-drop-1 lg:block">
          <button className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white shadow-drop-2 transition hover:-translate-y-0.5">
            <AddRoundedIcon fontSize="small" />
            New upload
          </button>

          <nav className="mt-6 space-y-1 text-sm font-medium">
            {['My files', 'Shared', 'Recent', 'Starred', 'Trash'].map(
              (item, index) => (
                <a
                  key={item}
                  href="#"
                  className={`flex rounded-md px-3 py-2 transition ${
                    index === 0
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-muted hover:bg-black/5 hover:text-app'
                  }`}
                >
                  {item}
                </a>
              )
            )}
          </nav>

          <div className="mt-8 rounded-md border border-app bg-[var(--surface-soft)] p-4">
            <StorageOutlinedIcon className="text-accent" fontSize="small" />
            <p className="mt-3 text-sm font-semibold text-app">Storage</p>
            <p className="mt-1 text-xs text-muted">68.4 GB of 100 GB used</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
              <div className="h-full w-[68%] rounded-full bg-accent" />
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="rounded-lg border border-app surface p-5 shadow-drop-1 sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-accent">
                  Cloud workspace
                </p>
                <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight text-app sm:text-5xl">
                  All your files, organized and ready to share.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-muted">
                  Keep documents, media, and team folders in one clean workspace
                  with fast access to recent uploads and storage health.
                </p>
              </div>

              <div className="flex gap-2">
                <button className="grid h-11 w-11 place-items-center rounded-md border border-app text-muted transition hover:bg-black/5 hover:text-app">
                  <SearchRoundedIcon fontSize="small" />
                </button>
                <button className="flex h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white shadow-drop-2">
                  <AddRoundedIcon fontSize="small" />
                  Upload
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {folders.map((folder) => (
                <article
                  className="rounded-md border border-app bg-[var(--surface-soft)] p-4"
                  key={folder.name}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-md ${folder.color} text-white`}
                    >
                      <FolderOutlinedIcon fontSize="small" />
                    </span>
                    <button className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-black/5">
                      <MoreHorizRoundedIcon fontSize="small" />
                    </button>
                  </div>
                  <h2 className="mt-5 text-sm font-semibold text-app">
                    {folder.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{folder.files}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-app surface shadow-drop-1">
            <div className="flex items-center justify-between border-b border-app px-5 py-4">
              <h2 className="text-base font-semibold text-app">Recent files</h2>
              <a href="#" className="text-sm font-semibold text-accent">
                View all
              </a>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {files.map((file) => {
                const Icon = file.icon;

                return (
                  <div
                    className="flex items-center justify-between gap-4 px-5 py-4"
                    key={file.name}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--surface-soft)] text-accent">
                        <Icon fontSize="small" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-app">
                          {file.name}
                        </p>
                        <p className="text-sm text-muted">{file.meta}</p>
                      </div>
                    </div>
                    <button className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted hover:bg-black/5">
                      <MoreHorizRoundedIcon fontSize="small" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-lg border border-app surface p-5 shadow-drop-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-app">Sync status</h2>
              <CloudDoneOutlinedIcon className="text-accent" fontSize="small" />
            </div>
            <div className="mt-5 space-y-4">
              {[
                ['MacBook Pro', 'Synced 2 min ago', '100%'],
                ['Design team', '24 files processing', '78%'],
                ['Mobile uploads', 'Waiting on Wi-Fi', '42%'],
              ].map(([name, detail, progress]) => (
                <div key={name}>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-medium text-app">{name}</span>
                    <span className="text-muted">{progress}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{detail}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: progress }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-app surface p-5 shadow-drop-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <ShieldOutlinedIcon fontSize="small" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-app">
              Protected sharing
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Links can expire automatically and sensitive folders stay locked
              behind team permissions.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
