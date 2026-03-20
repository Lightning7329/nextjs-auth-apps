import { CognitoButton } from './_components/cognito-button';
import { CredentialForm } from './_components/credential-form';
import { GitHubButton } from './_components/github-button';

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col w-full max-w-3xl items-center justify-between py-16 px-16 rounded-lg shadow-md bg-white dark:bg-gray-900 sm:items-start">
        <h1 className="text-5xl font-bold">Sign In</h1>
        <div className="w-full p-8 flex justify-between items-center">
          <CredentialForm />

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
