import { IAMClient, CreateRoleCommand, AttachRolePolicyCommand } from "@aws-sdk/client-iam";
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, CreateBucketCommand, PutBucketPublicAccessBlockCommand } from "@aws-sdk/client-s3";

export async function fullyAutomatedSetup(userAwsConfig: {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  tenantId: string;
}) {
  const credentials = {
    accessKeyId: userAwsConfig.accessKeyId,
    secretAccessKey: userAwsConfig.secretAccessKey,
  };
  const region = userAwsConfig.region;

  // 1. Automatically Create Cross-Account IAM Role
  const iam = new IAMClient({ region, credentials });
  const roleName = `AgenticBakeryRole-${userAwsConfig.tenantId}`;
  
  const trustPolicy = {
    Version: "2012-10-17",
    Statement: [{
      Effect: "Allow",
      Principal: { AWS: "arn:aws:iam::YOUR_CONTROL_PLANE_ACCOUNT_ID:root" },
      Action: "sts:AssumeRole",
      Condition: { StringEquals: { "sts:ExternalId": "bakery-uk-fca-secure-9901" } }
    }]
  };

  await iam.send(new CreateRoleCommand({
    RoleName: roleName,
    AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
    Description: "Auto-provisioned by Agentic Bakery Control Plane",
  }));

  // 2. Automatically Create Customer DynamoDB Table for Agent Memory
  const dynamo = new DynamoDBClient({ region, credentials });
  await dynamo.send(new CreateTableCommand({
    TableName: `agentic-bakery-memory-${userAwsConfig.tenantId}`,
    AttributeDefinitions: [{ AttributeName: "sessionId", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "sessionId", KeyType: "HASH" }],
    BillingMode: "PAY_PER_REQUEST",
  }));

  // 3. Automatically Create Customer S3 Bucket for RAG & Knowledge Bases
  const s3 = new S3Client({ region, credentials });
  const bucketName = `agentic-bakery-kb-${userAwsConfig.tenantId.toLowerCase()}-${Date.now()}`;
  
  await s3.send(new CreateBucketCommand({
    Bucket: bucketName,
    CreateBucketConfiguration: region !== "us-east-1" ? { LocationConstraint: region as any } : undefined,
  }));

  // Block Public Access on customer bucket
  await s3.send(new PutBucketPublicAccessBlockCommand({
    Bucket: bucketName,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      IgnorePublicAcls: true,
      BlockPublicPolicy: true,
      RestrictPublicBuckets: true,
    },
  }));

  return {
    status: "SUCCESS",
    roleName,
    bucketName,
    tableName: `agentic-bakery-memory-${userAwsConfig.tenantId}`,
  };
}