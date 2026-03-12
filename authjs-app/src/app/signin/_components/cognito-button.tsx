'use client';

import Image from 'next/image';

import { signInWithCognito } from '@/lib/auth/actions';

export function CognitoButton() {
  return (
    <button
      className="flex gap-x-2 items-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded focus:outline-none focus:shadow-outline"
      type="button"
      onClick={() => signInWithCognito()}
    >
      <Image
        className="inline-block"
        src="/cognito-icon.svg"
        alt="Cognito Logo"
        width={20}
        height={20}
      />
      Sign In with Cognito
    </button>
  );
}
