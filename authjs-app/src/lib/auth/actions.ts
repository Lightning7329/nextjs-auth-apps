'use server';

import { signIn, signOut } from './auth';

export async function signInWithCognito() {
  await signIn('cognito', { redirectTo: '/dashboard' });
}

export async function signInWithGitHub() {
  await signIn('github', { redirectTo: '/dashboard' });
}

export async function signOutAction() {
  await signOut({ redirectTo: '/signin' });
}
