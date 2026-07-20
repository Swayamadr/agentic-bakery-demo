import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

interface DataPlaneStackProps extends cdk.StackProps {
  tenantId: string;
  controlPlaneAccountId: string;
}

export class DataPlaneStack extends cdk.Stack {
  public readonly agentMemoryTable: dynamodb.Table;
  public readonly knowledgeBaseBucket: s3.Bucket;
  public readonly crossAccountRole: iam.Role;

  constructor(scope: Construct, id: string, props: DataPlaneStackProps) {
    super(scope, id, props);

    // 1. Customer-Owned DynamoDB Table for Agent Memory & Sessions
    this.agentMemoryTable = new dynamodb.Table(this, 'TenantAgentMemory', {
      tableName: `agentic-bakery-memory-${props.tenantId}`,
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN in production
    });

    // 2. Customer-Owned S3 Bucket for Knowledge Base & RAG Documents
    this.knowledgeBaseBucket = new s3.Bucket(this, 'TenantKnowledgeBaseBucket', {
      bucketName: `agentic-bakery-kb-${props.tenantId}-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 3. Cross-Account IAM Role granted access to manage these tenant resources
    this.crossAccountRole = new iam.Role(this, 'AgenticBakeryTenantRole', {
      roleName: `AgenticBakeryTenantRole-${props.tenantId}`,
      assumedBy: new iam.AccountPrincipal(props.controlPlaneAccountId),
      externalIds: ['bakery-uk-fca-secure-9901'],
    });

    // Grant access exclusively to these customer-owned resources
    this.agentMemoryTable.grantReadWriteData(this.crossAccountRole);
    this.knowledgeBaseBucket.grantReadWrite(this.crossAccountRole);
    
    // Grant Bedrock model execution rights
    this.crossAccountRole.addToPolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
      resources: ['*'],
    }));
  }
}