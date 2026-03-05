#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { AuthStack } from "../lib/auth-stack";

const RESOURCE_NAME_PREFIX = "nextjs-better-auth";
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
new AuthStack(app, "AuthStack", {
  stackName: `${RESOURCE_NAME_PREFIX}-stack`,
  resourceNamePrefix: RESOURCE_NAME_PREFIX,
  env: env,
});
