#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { SessionStack } from "../lib/authjs-session-stack";

const RESOURCE_NAME_PREFIX = "nextjs-auth-apps";
const env = {
  account: "000000000000",
  region: "ap-northeast-1",
};

const app = new cdk.App();

new SessionStack(app, "AuthjsSessionStack", {
  stackName: `${RESOURCE_NAME_PREFIX}-authjs-session-stack`,
  resourceNamePrefix: `${RESOURCE_NAME_PREFIX}-authjs`,
  env,
});
