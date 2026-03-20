import { betterAuth } from 'better-auth';

import { cognitoCredential } from './cognito-credential-plugin';

export const auth = betterAuth({
  plugins: [
    cognitoCredential({
      region: process.env.COGNITO_REGION as string,
      userPoolId: process.env.COGNITO_USER_POOL_ID as string,
      clientId: process.env.COGNITO_CLIENT_ID as string,
      clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
    }),
  ],
  socialProviders: {
    cognito: {
      clientId: process.env.COGNITO_CLIENT_ID as string,
      clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
      domain: process.env.COGNITO_DOMAIN as string,
      region: process.env.COGNITO_REGION as string,
      userPoolId: process.env.COGNITO_USER_POOL_ID as string,
      scopes: [
        'openid',
        'email',
        'profile',
        'aws.cognito.signin.user.admin',
      ],
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});
