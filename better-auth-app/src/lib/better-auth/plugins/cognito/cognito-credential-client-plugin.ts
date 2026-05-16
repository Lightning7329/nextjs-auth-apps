import type { BetterAuthClientPlugin } from 'better-auth/client';

import type { cognitoCredential } from './cognito-credential-plugin';
import { PROVIDER_ID } from './cognito-credential-plugin';

export const cognitoCredentialClient = () => {
  return {
    id: PROVIDER_ID,
    $InferServerPlugin: {} as ReturnType<typeof cognitoCredential>,
  } satisfies BetterAuthClientPlugin;
};
