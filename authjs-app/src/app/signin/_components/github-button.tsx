'use client';

import Image from 'next/image';

import { signInWithGitHub } from '@/lib/auth/actions';

export function GitHubButton() {
  return (
    <button
      className="flex gap-x-2 items-center bg-black dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-black font-bold py-2 px-3 rounded focus:outline-none focus:shadow-outline"
      type="button"
      onClick={() => signInWithGitHub()}
    >
      <Image
        className="inline-block invert dark:invert-0 rounded-sm"
        src="/github-svgrepo-com.svg"
        alt="GitHub Logo"
        width={20}
        height={20}
      />
      Sign In with GitHub
    </button>
  );
}
