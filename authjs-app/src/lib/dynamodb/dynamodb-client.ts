import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export const dynamoClient = new DynamoDBClient({
  profile: process.env.AWS_PROFILE,
  region: process.env.AUTH_DYNAMODB_REGION ?? 'ap-northeast-1',
});

export const dynamoDocument = DynamoDBDocument.from(dynamoClient, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});
