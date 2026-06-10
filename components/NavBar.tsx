'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

const NavBar = () => {
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authPaths = ['/sign-in', '/sign-up'];
  const isAuthPage = authPaths.includes(pathName);
  const isDashboardPage = pathName.startsWith('/dashboard');

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-app surface/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-app">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-white">
              <CloudQueueOutlinedIcon fontSize="small" />
            </span>
            <span className="text-xl font-semibold tracking-tight">
              MyCloud
            </span>
          </Link>

          {isDashboardPage ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-md bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold text-app"
              >
                Dashboard
              </Link>
            </div>
          ) : isAuthPage ? (
            <p></p>
          ) : (
            // <button
            //   aria-label="Language"
            //   className="grid h-10 w-10 place-items-center rounded-md text-muted transition hover:bg-black/5 hover:text-app"
            // >
            //   <LanguageIcon fontSize="small" />
            // </button>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/sign-in"
                className="hidden rounded-md px-3 py-2 text-sm font-semibold text-muted transition hover:bg-black/5 hover:text-app md:block"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="hidden rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-drop-2 transition hover:-translate-y-0.5 md:block"
              >
                Sign up
              </Link>
              <button
                aria-expanded={isMenuOpen}
                aria-label="Open menu"
                className="grid h-10 w-10 place-items-center rounded-md text-muted transition hover:bg-black/5 hover:text-app md:hidden"
                onClick={() => setIsMenuOpen((current) => !current)}
                type="button"
              >
                <MenuRoundedIcon fontSize="small" />
              </button>
            </div>
          )}
        </div>

        {!isAuthPage && !isDashboardPage && isMenuOpen && (
          <div className="mt-3 rounded-md border border-app bg-[var(--surface)] p-2 shadow-drop-2 md:hidden">
            <div className="my-2 h-px bg-[var(--border)]" />
            <Link
              className="block rounded-md px-3 py-2 text-sm font-semibold text-muted transition hover:bg-black/5 hover:text-app"
              href="/sign-in"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link
              className="block rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white"
              href="/sign-up"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
