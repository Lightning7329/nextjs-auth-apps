import { SignOutButton } from './sign-out-button';

export function Header() {
  return (
    <header className="w-full py-2 px-8 bg-white dark:bg-gray-900 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Next.js Auth.js
        </h1>
        <SignOutButton />
      </div>
    </header>
  );
}
