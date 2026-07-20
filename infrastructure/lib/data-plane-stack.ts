import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

interface DataPlaneStackProps extends cdk.StackProps {
  tenantId: string;
  controlPlaneAccountId: string;
}

export class DataPlaneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DataPlaneStackProps) {
    super(scope, id, props);

    // Cross-Account IAM Role assumed by Control Plane
    const crossAccountRole = new iam.Role(this, 'CustomerAgentExecutionRole', {
      roleName: `AgenticBakery-${props.tenantId}-ExecutionRole`,
      assumedBy: new iam.AccountPrincipal(props.controlPlaneAccountId),
      externalIds: [props.tenantId], // Protection against Confused Deputy Problem
    });

    // Bedrock AgentCore Runtime Permissions
    crossAccountRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'bedrock:InvokeModel',
          'bedrock:InvokeModelWithResponseStream',
          'bedrock:Retrieve',
          'bedrock:CreateAgent',
        ],
        resources: ['*'],
      })
    );

    new cdk.CfnOutput(this, 'RoleArnOutput', {
      value: crossAccountRole.roleArn,
      description: 'IAM Role ARN for Control Plane STS AssumeRole access',
    });
  }
}