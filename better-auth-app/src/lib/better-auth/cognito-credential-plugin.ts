import { createHmac } from "node:crypto";

import {
  AdminInitiateAuthCommand,
  CognitoIdentityProviderClient,
  type AdminInitiateAuthCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { APIError } from "better-call";
import { z } from "zod";

interface CognitoCredentialOptions {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
}

function computeSecretHash(
  username: string,
  clientId: string,
  clientSecret: string,
): string {
  return createHmac("sha256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

export const cognitoCredential = (
  options: CognitoCredentialOptions,
): BetterAuthPlugin => {
  const cognitoClient = new CognitoIdentityProviderClient({
    region: options.region,
  });

  return {
    id: "cognito-credential",
    endpoints: {
      signInWithCognitoCredential: createAuthEndpoint(
        "/sign-in/cognito-credential",
        {
          method: "POST",
          body: z.object({
            email: z.string().email(),
            password: z.string(),
          }),
        },
        async (ctx) => {
          const { email, password } = ctx.body;

          const secretHash = computeSecretHash(
            email,
            options.clientId,
            options.clientSecret,
          );

          let result: AdminInitiateAuthCommandOutput;

          try {
            result = await cognitoClient.send(
              new AdminInitiateAuthCommand({
                AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
                UserPoolId: options.userPoolId,
                ClientId: options.clientId,
                AuthParameters: {
                  USERNAME: email,
                  PASSWORD: password,
                  SECRET_HASH: secretHash,
                },
              }),
            );

            if (result.ChallengeName) {
              throw new APIError("FORBIDDEN", {
                message: `Authentication challenge required: ${result.ChallengeName}`,
              });
            }
          } catch (error) {
            if (error instanceof APIError) throw error;

            const errorName =
              error instanceof Error ? error.constructor.name : "";
            const errorMessage =
              error instanceof Error ? error.message : String(error);

            console.error(
              "[cognito-credential] AdminInitiateAuth failed:",
              {
                errorName,
                errorMessage,
                errorType: typeof error,
                error,
              },
            );

            if (
              errorName === "NotAuthorizedException" ||
              errorName === "UserNotFoundException"
            ) {
              throw new APIError("UNAUTHORIZED", {
                message: "Invalid email or password",
              });
            }
            if (errorName === "UserNotConfirmedException") {
              throw new APIError("FORBIDDEN", {
                message: "User is not confirmed",
              });
            }
            if (errorName === "PasswordResetRequiredException") {
              throw new APIError("FORBIDDEN", {
                message: "Password reset required",
              });
            }

            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Authentication failed",
            });
          }

          const authResult = result.AuthenticationResult;
          if (!authResult?.AccessToken) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "No authentication result returned",
            });
          }

          // Find or create user
          const existingUser =
            await ctx.context.internalAdapter.findUserByEmail(email);

          let user;
          if (existingUser) {
            user = existingUser.user;

            const existingAccount =
              await ctx.context.internalAdapter.findAccountByProviderId(
                email,
                "cognito-credential",
              );

            if (existingAccount) {
              await ctx.context.internalAdapter.updateAccount(
                existingAccount.id,
                {
                  accessToken: authResult.AccessToken,
                  refreshToken: authResult.RefreshToken,
                  idToken: authResult.IdToken,
                  accessTokenExpiresAt: new Date(
                    Date.now() + (authResult.ExpiresIn ?? 3600) * 1000,
                  ),
                },
              );
            }
          } else {
            const created = await ctx.context.internalAdapter.createUser({
              email,
              name: email,
              emailVerified: true,
            });
            await ctx.context.internalAdapter.createAccount({
              userId: created.id,
              providerId: "cognito-credential",
              accountId: email,
              accessToken: authResult.AccessToken,
              refreshToken: authResult.RefreshToken,
              idToken: authResult.IdToken,
              accessTokenExpiresAt: new Date(
                Date.now() + (authResult.ExpiresIn ?? 3600) * 1000,
              ),
            });
            user = created;
          }

          const session =
            await ctx.context.internalAdapter.createSession(user.id);

          await setSessionCookie(ctx, { session, user });

          return ctx.json({ user, session });
        },
      ),
    },
  };
};
