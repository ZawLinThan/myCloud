'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

const NavBar = () => {
  const pathName = usePathname();
  const authPaths = ['/sign-in', '/sign-up'];
  const isAuthPage = authPaths.includes(pathName);

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

          {isAuthPage ? (
            <button
              aria-label="Language"
              className="grid h-10 w-10 place-items-center rounded-md text-muted transition hover:bg-black/5 hover:text-app"
            >
              <LanguageIcon fontSize="small" />
            </button>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-6 text-sm font-medium md:flex">
                <Link href="/#products" className="text-muted hover:text-app">
                  Products
                </Link>
                <Link href="/#features" className="text-muted hover:text-app">
                  Features
                </Link>
                <Link href="/#support" className="text-muted hover:text-app">
                  Support
                </Link>
              </div>
              <Link
                href="/sign-in"
                className="hidden rounded-md px-3 py-2 text-sm font-semibold text-muted transition hover:bg-black/5 hover:text-app sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-drop-2 transition hover:-translate-y-0.5"
              >
                Sign up
              </Link>
              <button
                aria-label="Open menu"
                className="grid h-10 w-10 place-items-center rounded-md text-muted transition hover:bg-black/5 hover:text-app md:hidden"
              >
                <MenuRoundedIcon fontSize="small" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
