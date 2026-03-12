import { aws_cognito as cognito } from "aws-cdk-lib";
import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface AuthStackProps extends StackProps {
  resourceNamePrefix: string;
}

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `${props.resourceNamePrefix}-user-pool`,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const appClient = userPool.addClient("AppClient", {
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
        callbackUrls: [
          "http://localhost:3000/api/auth/callback/cognito",
          "http://localhost:3001/api/auth/callback/cognito",
        ],
        logoutUrls: [
          "http://localhost:3000/signin",
          "http://localhost:3001/signin",
        ],
      },
      generateSecret: true,
      idTokenValidity: Duration.minutes(7),
      accessTokenValidity: Duration.minutes(7),
      refreshTokenValidity: Duration.days(1),
      authSessionValidity: Duration.minutes(5),
    });

    userPool.addDomain("CognitoDomain", {
      cognitoDomain: {
        domainPrefix: props.resourceNamePrefix,
      },
      managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });

    new cognito.CfnManagedLoginBranding(this, "ManagedLoginBranding", {
      userPoolId: userPool.userPoolId,
      clientId: appClient.userPoolClientId,
      useCognitoProvidedValues: true,
    });

    new CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
      exportName: `${props.resourceNamePrefix}-user-pool-id`,
    });

    new CfnOutput(this, "UserPoolDomain", {
      value: `https://${props.resourceNamePrefix}.auth.${this.region}.amazoncognito.com`,
      exportName: `${props.resourceNamePrefix}-user-pool-domain`,
    });

    new CfnOutput(this, "AppClientId", {
      value: appClient.userPoolClientId,
      exportName: `${props.resourceNamePrefix}-app-client-id`,
    });
  }
}
