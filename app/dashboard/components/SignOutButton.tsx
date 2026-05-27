'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import { logout } from '@/lib/actions/user.actions';

export default function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await logout();
      router.replace('/sign-in');
      router.refresh();
    });
  };

  return (
    <button
      aria-label="Sign out"
      className="grid h-10 w-10 place-items-center rounded-md border border-app text-muted transition hover:bg-black/5 hover:text-app"
      disabled={isPending}
      onClick={handleSignOut}
      title="Sign out"
      type="button"
    >
      <LogoutRoundedIcon fontSize="small" />
    </button>
  );
}
