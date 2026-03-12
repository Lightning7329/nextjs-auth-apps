import { CognitoButton } from './_components/cognito-button';
import { GitHubButton } from './_components/github-button';

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col w-full max-w-3xl items-center justify-between py-16 px-16 rounded-lg shadow-md bg-white dark:bg-gray-900 sm:items-start">
        <h1 className="text-5xl font-bold">Sign In</h1>
        <div className="w-full p-8 flex justify-between items-center">
          <form>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                placeholder="Username"
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="Password"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
              >
                Sign In
              </button>
            </div>
          </form>

          <Splitter />

          <div className="flex flex-col gap-4">
            <CognitoButton />
            <GitHubButton />
          </div>
        </div>
      </main>
    </div>
  );
}

function Splitter() {
  return (
    <div className="flex flex-col justify-between items-center gap-1 self-stretch">
      <div className="w-px flex-auto bg-gray-600" />
      <span className="text-gray-500">or</span>
      <div className="w-px flex-auto bg-gray-600" />
    </div>
  );
}
