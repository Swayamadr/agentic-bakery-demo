import { IAMClient, CreateRoleCommand } from "@aws-sdk/client-iam";
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, CreateBucketCommand, PutBucketPublicAccessBlockCommand } from "@aws-sdk/client-s3";

interface AutomatedSetupConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  tenantId: string;
  controlPlaneAccountId: string;
  externalId: string;
}

export async function fullyAutomatedSetup(userAwsConfig: AutomatedSetupConfig) {
  const credentials = {
    accessKeyId: userAwsConfig.accessKeyId,
    secretAccessKey: userAwsConfig.secretAccessKey,
  };
  const region = userAwsConfig.region;
  const sanitizedTenant = userAwsConfig.tenantId.toLowerCase().replace(/[^a-z0-9-]/g, "");

  // 1. Provision Cross-Account Access Role
  const iam = new IAMClient({ region, credentials });
  const roleName = `AppIntegrationRole-${userAwsConfig.tenantId}`;
  
  const trustPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: `arn:aws:iam::${userAwsConfig.controlPlaneAccountId}:root` },
        Action: "sts:AssumeRole",
        Condition: {
          StringEquals: { "sts:ExternalId": userAwsConfig.externalId },
        },
      },
    ],
  };

  await iam.send(
    new CreateRoleCommand({
      RoleName: roleName,
      AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
      Description: "Provisioned by Management Control Plane for cross-account integration",
    })
  );

  // 2. Provision Tenant State Table in DynamoDB
  const dynamo = new DynamoDBClient({ region, credentials });
  const tableName = `app-session-state-${sanitizedTenant}`;

  await dynamo.send(
    new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [{ AttributeName: "sessionId", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "sessionId", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    })
  );

  // 3. Provision Isolated Storage Bucket in S3
  const s3 = new S3Client({ region, credentials });
  const bucketName = `app-data-store-${sanitizedTenant}-${Date.now()}`;
  
  await s3.send(
    new CreateBucketCommand({
      Bucket: bucketName,
      CreateBucketConfiguration: region !== "us-east-1" ? { LocationConstraint: region as any } : undefined,
    })
  );

  // Enforce S3 Block Public Access
  await s3.send(
    new PutBucketPublicAccessBlockCommand({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
        BlockPublicPolicy: true,
        RestrictPublicBuckets: true,
      },
    })
  );

  return {
    status: "SUCCESS",
    roleName,
    bucketName,
    tableName,
  };
}