'use client';

import { signOutAction } from '@/lib/auth/actions';

export function SignOutButton() {
  return (
    <button
      className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      type="button"
      onClick={() => signOutAction()}
    >
      Sign Out
    </button>
  );
}
