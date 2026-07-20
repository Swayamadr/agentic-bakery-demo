import { BedrockAgentClient, CreateAgentCommand } from "@aws-sdk/client-bedrock-agent";

export interface DeployConfig {
  roleArn: string;
  agentName: string;
  tenantId: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  region?: string;
}

export async function deployBedrockAgentCore(config: DeployConfig) {
  const client = new BedrockAgentClient({
    region: config.region || "eu-west-2",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      sessionToken: config.sessionToken,
    },
  });

  const command = new CreateAgentCommand({
    agentName: `${config.agentName}-${config.tenantId}`,
    foundationModel: "anthropic.claude-3-haiku-20240307-v1:0",
    instruction: "You are an AI Compliance Agent running on customer Bedrock AgentCore data plane.",
    agentResourceRoleArn: config.roleArn,
  });

  return await client.send(command);
}