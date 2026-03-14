#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { AuthStack } from "../lib/auth-stack";
import { SessionStack } from "../lib/authjs-session-stack";

const RESOURCE_NAME_PREFIX = "nextjs-auth-apps";
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

new AuthStack(app, "AuthStack", {
  stackName: `${RESOURCE_NAME_PREFIX}-idp-stack`,
  resourceNamePrefix: `${RESOURCE_NAME_PREFIX}-idp`,
  env: env,
});

new SessionStack(app, "AuthjsSessionStack", {
  stackName: `${RESOURCE_NAME_PREFIX}-authjs-session-stack`,
  resourceNamePrefix: `${RESOURCE_NAME_PREFIX}-authjs`,
  env: env,
});
