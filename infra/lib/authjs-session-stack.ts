import {
  CfnOutput,
  RemovalPolicy,
  Stack,
  StackProps,
  aws_dynamodb as dynamodb,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SessionStackProps extends StackProps {
  resourceNamePrefix: string;
}

export class SessionStack extends Stack {
  constructor(scope: Construct, id: string, props: SessionStackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "SessionTable", {
      tableName: `${props.resourceNamePrefix}-session-table`,
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "expires",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    new CfnOutput(this, "SessionTableName", {
      value: table.tableName,
      exportName: `${props.resourceNamePrefix}-session-table-name`,
    });

    new CfnOutput(this, "SessionTableArn", {
      value: table.tableArn,
      exportName: `${props.resourceNamePrefix}-session-table-arn`,
    });
  }
}
