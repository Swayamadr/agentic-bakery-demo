// In services/control-plane-api/aws-connector.ts
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

export async function getCustomerStsCredentials(awsAccountId: string, region: string) {
  const sts = new STSClient({ region });

  const assumedRole = await sts.send(
    new AssumeRoleCommand({
      RoleArn: `arn:aws:iam::${awsAccountId}:role/AgenticBakeryRole`,
      RoleSessionName: `BakerySession-${Date.now()}`,
      ExternalId: "bakery-uk-fca-secure-9901",
      DurationSeconds: 900,
    })
  );

  return {
    accessKeyId: assumedRole.Credentials!.AccessKeyId!,
    secretAccessKey: assumedRole.Credentials!.SecretAccessKey!,
    sessionToken: assumedRole.Credentials!.SessionToken!,
  };
}