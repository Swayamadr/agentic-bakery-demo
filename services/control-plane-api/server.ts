import express, { Request, Response } from 'express';
import cors from 'cors';
import { STSClient, AssumeRoleCommand, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { IAMClient, CreateRoleCommand } from '@aws-sdk/client-iam';
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------------
// ENDPOINT 1: Real STS AssumeRole Handshake (Manual / Existing IAM Role)
// ------------------------------------------------------------------
app.post('/api/connect-aws', async (req: Request, res: Response) => {
  const { roleArn, externalId, region, tenantId } = req.body;

  try {
    console.log(`[STS] Attempting to assume role: ${roleArn} for tenant ${tenantId}`);

    // Create STS client in target region
    const stsClient = new STSClient({ region: region || 'eu-west-2' });

    // Attempt to assume the customer's cross-account role using External ID
    const command = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: `AgenticBakery-${tenantId}-${Date.now()}`,
      ExternalId: externalId,
      DurationSeconds: 900, // 15-minute temporary token
    });

    const response = await stsClient.send(command);

    if (!response.Credentials) {
      throw new Error('Failed to retrieve temporary STS credentials.');
    }

    console.log(`[STS] Success! Assumed Role Identity: ${response.AssumedRoleUser?.Arn}`);

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'STS AssumeRole Handshake Successful!',
      assumedRoleArn: response.AssumedRoleUser?.Arn,
      credentials: {
        accessKeyId: response.Credentials.AccessKeyId,
        secretAccessKey: response.Credentials.SecretAccessKey,
        sessionToken: response.Credentials.SessionToken,
        expiration: response.Credentials.Expiration,
      },
    });
  } catch (error: any) {
    console.error(`[STS ERROR] ${error.message}`);
    return res.status(400).json({
      error: true,
      message: `AWS STS Error: ${error.message || 'AccessDenied - Could not assume role.'}`,
    });
  }
});

// ------------------------------------------------------------------
// ENDPOINT 2: Real Automated Provisioning (Creating Real AWS Resources)
// ------------------------------------------------------------------
app.post('/api/auto-setup', async (req: Request, res: Response) => {
  const { accessKeyId, secretAccessKey, region, externalId, tenantId } = req.body;

  try {
    const credentials = { accessKeyId, secretAccessKey };
    const awsRegion = region || 'eu-west-2';

    // Step A: Validate caller identity
    const sts = new STSClient({ region: awsRegion, credentials });
    const identity = await sts.send(new GetCallerIdentityCommand({}));
    const accountId = identity.Account;

    // Step B: Create Cross-Account IAM Role dynamically
    const iam = new IAMClient({ region: awsRegion, credentials });
    const roleName = `AgenticBakeryRole-${tenantId}`;
    
    const trustPolicy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: `arn:aws:iam::${accountId}:root` },
        Action: 'sts:AssumeRole',
        Condition: { StringEquals: { 'sts:ExternalId': externalId } }
      }]
    };

    try {
      await iam.send(new CreateRoleCommand({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
        Description: 'Auto-provisioned cross-account role for Agentic Bakery Control Plane',
      }));
    } catch (e: any) {
      if (!e.message?.includes('already exists')) throw e;
    }

    // Step C: Create DynamoDB Memory Table
    const dynamo = new DynamoDBClient({ region: awsRegion, credentials });
    const tableName = `agentic-bakery-memory-${tenantId.toLowerCase()}`;
    
    try {
      await dynamo.send(new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [{ AttributeName: 'sessionId', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'sessionId', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }));
    } catch (e: any) {
      if (!e.message?.includes('already exists')) throw e;
    }

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Real AWS infrastructure provisioned directly!',
      accountId,
      roleArn: `arn:aws:iam::${accountId}:role/${roleName}`,
      tableName,
    });
  } catch (error: any) {
    console.error(`[AUTO SETUP ERROR] ${error.message}`);
    return res.status(400).json({
      error: true,
      message: `AWS Provisioning Error: ${error.message || 'Invalid AWS credentials.'}`,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Agentic Bakery Control Plane API running on http://localhost:${PORT}`);
});