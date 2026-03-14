import { DynamoDBAdapter } from '@auth/dynamodb-adapter';
import type { NextAuthConfig } from 'next-auth';
import Cognito from 'next-auth/providers/cognito';
import GitHub from 'next-auth/providers/github';

import { dynamoDocument } from '@/lib/dynamodb/dynamodb-client';

export const authConfig = {
  adapter: DynamoDBAdapter(dynamoDocument, {
    tableName: process.env.AUTH_DYNAMODB_TABLE_NAME,
  }),
  providers: [
    Cognito({
      clientId: process.env.AUTH_COGNITO_ID,
      clientSecret: process.env.AUTH_COGNITO_SECRET,
      issuer: process.env.AUTH_COGNITO_ISSUER,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/signin',
  },
} satisfies NextAuthConfig;
