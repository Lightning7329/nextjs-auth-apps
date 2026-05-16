import { createAuthClient } from 'better-auth/react';

import { cognitoCredentialClient } from './plugins/cognito/cognito-credential-client-plugin';

export const authClient = createAuthClient({
  plugins: [cognitoCredentialClient()],
});
