import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { fullyAutomatedSetup } from './fullyAutomatedSetup';
import { provisionCustomerDataResources } from './provisionCustomerDataResources';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ------------------------------------------------------------------
// Endpoint 1: Manual Connection via Cross-Account STS AssumeRole
// ------------------------------------------------------------------
app.post('/api/connect-aws', async (req: Request, res: Response) => {
  const { roleArn, externalId, region = 'eu-west-2', tenantId = 'DEFAULT-TENANT' } = req.body;

  try {
    const stsClient = new STSClient({ region });
    
    // Assume role in customer's account
    const assumeRoleResponse = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: `ControlPlaneSession-${tenantId}`,
        ExternalId: externalId,
        DurationSeconds: 3600,
      })
    );

    const credentials = assumeRoleResponse.Credentials;
    if (!credentials?.AccessKeyId || !credentials?.SecretAccessKey || !credentials?.SessionToken) {
      throw new Error('Failed to retrieve valid STS session credentials.');
    }

    // Provision metadata inside customer's data plane
    const storageResult = await provisionCustomerDataResources({
      assumedCredentials: {
        accessKeyId: credentials.AccessKeyId,
        secretAccessKey: credentials.SecretAccessKey,
        sessionToken: credentials.SessionToken,
      },
      tenantId,
      region,
      customerAccountId: roleArn.split(':')[4] || '123456789012',
    });

    return res.status(200).json({
      success: true,
      assumedRoleArn: assumeRoleResponse.AssumedRoleUser?.Arn,
      storageResult,
    });
  } catch (error: any) {
    console.error('STS AssumeRole Error:', error);
    return res.status(400).json({
      error: true,
      message: error.message || 'AccessDenied: Could not assume role in target AWS account.',
    });
  }
});

// ------------------------------------------------------------------
// Endpoint 2: Automated Direct AWS Infrastructure Provisioning
// ------------------------------------------------------------------
app.post('/api/auto-setup', async (req: Request, res: Response) => {
  const { accessKeyId, secretAccessKey, region = 'eu-west-2', tenantId = 'DEFAULT-TENANT', externalId = 'secure-ext-123' } = req.body;

  try {
    const result = await fullyAutomatedSetup({
      accessKeyId,
      secretAccessKey,
      region,
      tenantId,
      controlPlaneAccountId: '123456789012', // Replace with your actual control plane AWS account ID
      externalId,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Auto Setup Error:', error);
    return res.status(400).json({
      error: true,
      message: error.message || 'Failed to auto-provision AWS infrastructure.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Control Plane API listening on http://localhost:${PORT}`);
});