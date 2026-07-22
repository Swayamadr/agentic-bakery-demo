import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

interface AssumedCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

interface ProvisioningOptions {
  assumedCredentials: AssumedCredentials;
  tenantId: string;
  region: string;
  customerAccountId: string;
}

export async function provisionCustomerDataResources({
  assumedCredentials,
  tenantId,
  region,
  customerAccountId,
}: ProvisioningOptions) {
  // Initialize clients using short-lived assumed STS credentials
  const dynamoClient = new DynamoDBClient({
    region,
    credentials: assumedCredentials,
  });

  const s3Client = new S3Client({
    region,
    credentials: assumedCredentials,
  });

  const sanitizedTenant = tenantId.toLowerCase();

  // 1. Initialize session metadata record in customer DynamoDB table
  await dynamoClient.send(
    new PutItemCommand({
      TableName: `app-session-state-${sanitizedTenant}`,
      Item: {
        sessionId: { S: 'init-session' },
        createdAt: { S: new Date().toISOString() },
        status: { S: 'ACTIVE' },
        schemaVersion: { S: '1.0.0' },
      },
    })
  );

  // 2. Upload tenant configuration document to customer S3 bucket
  await s3Client.send(
    new PutObjectCommand({
      Bucket: `app-data-store-${sanitizedTenant}-${customerAccountId}`,
      Key: 'config/tenant-policy.json',
      Body: JSON.stringify({
        tenantId,
        configuredAt: new Date().toISOString(),
        status: 'ENABLED',
      }),
      ContentType: 'application/json',
    })
  );

  return {
    success: true,
    message: 'Customer storage resources initialized successfully.',
  };
}