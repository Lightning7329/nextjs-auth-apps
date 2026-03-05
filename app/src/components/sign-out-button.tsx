'use client';

import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/better-auth/auth-client';

export function SignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/signin');
        },
      },
    });
  };

  return (
    <button
      className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      type="button"
      onClick={signOut}
    >
      Sign Out
    </button>
  );
}
