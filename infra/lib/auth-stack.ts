import { aws_cognito as cognito } from "aws-cdk-lib";
import { Duration, Stack, StackProps } from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface AuthStackProps extends StackProps {
  resourceNamePrefix: string;
}

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const pool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `${props.resourceNamePrefix}-user-pool`,
      signInAliases: {
        username: true,
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    pool.addClient("AppClient", {
      userPoolClientName: `${props.resourceNamePrefix}-app-client`,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
          clientCredentials: false,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
          cognito.OAuthScope.COGNITO_ADMIN,
        ],
        callbackUrls: ["http://localhost:3000/api/auth/callback/cognito"],
        logoutUrls: ["http://localhost:3000/signin"],
      },
      generateSecret: true,
      idTokenValidity: Duration.minutes(7),
      accessTokenValidity: Duration.minutes(7),
      refreshTokenValidity: Duration.days(1),
      authSessionValidity: Duration.minutes(5),
    });

    pool.addDomain("CognitoDomain", {
      cognitoDomain: {
        domainPrefix: props.resourceNamePrefix,
      },
      managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });
  }
}
