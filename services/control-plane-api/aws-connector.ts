import { STSClient, AssumeRoleCommand, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

export interface ConnectConfig {
  roleArn: string;
  externalId: string;
  region?: string;
}

export async function verifyAwsRoleConnection(config: ConnectConfig) {
  const region = config.region || "eu-west-2";
  const stsClient = new STSClient({ region });

  const assumeRoleCommand = new AssumeRoleCommand({
    RoleArn: config.roleArn,
    RoleSessionName: `AgenticBakery-Verify-${Date.now()}`,
    ExternalId: config.externalId,
    DurationSeconds: 900,
  });

  const assumedRole = await stsClient.send(assumeRoleCommand);
  const credentials = assumedRole.Credentials;

  if (!credentials) {
    throw new Error("Failed to retrieve temporary AWS STS credentials.");
  }

  // Verify caller identity using assumed credentials
  const targetStsClient = new STSClient({
    region,
    credentials: {
      accessKeyId: credentials.AccessKeyId!,
      secretAccessKey: credentials.SecretAccessKey!,
      sessionToken: credentials.SessionToken!,
    },
  });

  const identity = await targetStsClient.send(new GetCallerIdentityCommand({}));

  return {
    success: true,
    targetAccountId: identity.Account,
    assumedRoleArn: identity.Arn,
  };
}