import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import path from 'path';

import { PrismaClient } from '../../generated/prisma/client';

import { cognitoCredential } from './plugins/cognito/cognito-credential-plugin';

const adapter = new PrismaBetterSqlite3({
  url: path.join(process.cwd(), 'sqlite.db'),
});
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
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
