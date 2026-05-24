import React from 'react';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';

const highlights = [
  {
    title: 'Encrypted storage',
    text: 'Keep private folders protected with workspace-level controls.',
    icon: LockOutlinedIcon,
  },
  {
    title: 'Quick sharing',
    text: 'Send clean links to teammates, clients, or devices.',
    icon: ShareOutlinedIcon,
  },
  {
    title: 'Live sync',
    text: 'Recent uploads stay current across the whole workspace.',
    icon: SyncOutlinedIcon,
  },
];

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app-shell min-h-screen px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-app surface shadow-drop-3 lg:grid-cols-[1fr_440px]">
        <section className="hidden bg-[var(--surface-soft)] p-8 lg:block">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-accent text-white">
              <CloudQueueOutlinedIcon fontSize="small" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-app">MyCloud</h1>
              <p className="text-sm text-muted">Your files, always close.</p>
            </div>
          </div>

          <div className="mt-14 max-w-md">
            <p className="text-sm font-semibold text-accent">
              Secure by design
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-app">
              Start every session with the right workspace.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Uploads, shared links, device sync, and permissions stay organized
              behind one account.
            </p>
          </div>

          <div className="mt-10 grid gap-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="rounded-md border border-app surface p-4"
                  key={item.title}
                >
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-700">
                      <Icon fontSize="small" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-app">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          {children}
        </section>
      </div>
    </div>
  );
};

export default layout;
