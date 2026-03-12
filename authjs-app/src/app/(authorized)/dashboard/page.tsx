import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';

export default async function Dashboard() {
  const session = await auth();
  if (!session) {
    redirect('/signin');
  }

  const { user } = session;
  console.log(user);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col min-h-screen w-full max-w-3xl py-16 px-16 shadow-md bg-white dark:bg-gray-900">
        <h1 className="text-5xl font-bold">Dashboard</h1>
        <p className="mt-4 text-lg">
          Welcome back, {user?.name || user?.email}!
        </p>
      </main>
    </div>
  );
}
