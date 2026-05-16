import { createHmac } from 'node:crypto';

import {
  AdminInitiateAuthCommand,
  type AdminInitiateAuthCommandOutput,
  type AuthenticationResultType,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import type { AuthContext, BetterAuthPlugin, User } from 'better-auth';
import { createAuthEndpoint } from 'better-auth/api';
import { setSessionCookie } from 'better-auth/cookies';
import { APIError } from 'better-call';
import { z } from 'zod';

const PROVIDER_ID = 'cognito-credential';

interface CognitoCredentialOptions {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
}

export const cognitoCredential = (
  options: CognitoCredentialOptions,
): BetterAuthPlugin => {
  const cognitoClient = new CognitoIdentityProviderClient({
    region: options.region,
  });

  return {
    id: PROVIDER_ID,
    endpoints: {
      signInWithCognitoCredential: createAuthEndpoint(
        '/sign-in/cognito-credential',
        {
          method: 'POST',
          body: z.object({
            email: z.email(),
            password: z.string(),
          }),
        },
        async (ctx) => {
          const { email, password } = ctx.body;

          const result = await authenticateWithCognito(cognitoClient, {
            userPoolId: options.userPoolId,
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            email,
            password,
          });

          const authResult = result.AuthenticationResult;
          if (!authResult?.AccessToken) {
            throw new APIError('INTERNAL_SERVER_ERROR', {
              message: 'No authentication result returned',
            });
          }

          const user = await findOrCreateCognitoUser(
            ctx.context.internalAdapter,
            email,
            authResult,
          );

          const session = await ctx.context.internalAdapter.createSession(
            user.id,
          );

          await setSessionCookie(ctx, { session, user });

          return ctx.json({ user, session });
        },
      ),
    },
  };
};

function computeSecretHash(
  username: string,
  clientId: string,
  clientSecret: string,
): string {
  return createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

async function authenticateWithCognito(
  cognitoClient: CognitoIdentityProviderClient,
  params: {
    userPoolId: string;
    clientId: string;
    clientSecret: string;
    email: string;
    password: string;
  },
): Promise<AdminInitiateAuthCommandOutput> {
  const secretHash = computeSecretHash(
    params.email,
    params.clientId,
    params.clientSecret,
  );

  try {
    const result = await cognitoClient.send(
      new AdminInitiateAuthCommand({
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        UserPoolId: params.userPoolId,
        ClientId: params.clientId,
        AuthParameters: {
          USERNAME: params.email,
          PASSWORD: params.password,
          SECRET_HASH: secretHash,
        },
      }),
    );

    if (result.ChallengeName) {
      throw new APIError('FORBIDDEN', {
        message: `Authentication challenge required: ${result.ChallengeName}`,
      });
    }

    return result;
  } catch (error) {
    if (error instanceof APIError) throw error;

    const errorName = error instanceof Error ? error.constructor.name : '';
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('[cognito-credential] AdminInitiateAuth failed:', {
      errorName,
      errorMessage,
      errorType: typeof error,
      error,
    });

    if (
      errorName === 'NotAuthorizedException' ||
      errorName === 'UserNotFoundException'
    ) {
      throw new APIError('UNAUTHORIZED', {
        message: 'Invalid email or password',
      });
    }
    if (errorName === 'UserNotConfirmedException') {
      throw new APIError('FORBIDDEN', {
        message: 'User is not confirmed',
      });
    }
    if (errorName === 'PasswordResetRequiredException') {
      throw new APIError('FORBIDDEN', {
        message: 'Password reset required',
      });
    }

    throw new APIError('INTERNAL_SERVER_ERROR', {
      message: 'Authentication failed',
    });
  }
}

function tokenExpiresAt(expiresIn: number | undefined): Date {
  return new Date(Date.now() + (expiresIn ?? 3600) * 1000);
}

/**
 * Cognitoの認証結果をもとに、既存ユーザーのトークンを更新するか、新規ユーザーとアカウントを作成する。
 */
async function findOrCreateCognitoUser(
  adapter: AuthContext['internalAdapter'],
  email: string,
  authResult: AuthenticationResultType,
): Promise<User> {
  const tokenData = {
    accessToken: authResult.AccessToken,
    refreshToken: authResult.RefreshToken,
    idToken: authResult.IdToken,
    accessTokenExpiresAt: tokenExpiresAt(authResult.ExpiresIn),
  };

  const existingUser = await adapter.findUserByEmail(email);

  if (existingUser) {
    // ユーザーが存在する場合は、アカウントを検索して更新する。アカウントがなければ新規作成する
    const existingAccount = await adapter.findAccountByProviderId(
      email,
      PROVIDER_ID,
    );

    if (existingAccount) {
      await adapter.updateAccount(existingAccount.id, tokenData);
    }

    return existingUser.user;
  } else {
    // ユーザーが存在しない場合は、新規ユーザーとアカウントを作成する
    const created = await adapter.createUser({
      email,
      name: email,
      emailVerified: true,
    });
    await adapter.createAccount({
      userId: created.id,
      providerId: PROVIDER_ID,
      accountId: email,
      ...tokenData,
    });

    return created;
  }
}
