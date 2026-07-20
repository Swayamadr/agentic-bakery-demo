import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { verifyAwsRoleConnection } from "./aws-connector";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // Route 1: Verify Connection
    if (event.path === "/connect-aws" && event.httpMethod === "POST") {
      const result = await verifyAwsRoleConnection({
        roleArn: body.roleArn,
        externalId: body.externalId,
        region: body.region,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `Successfully connected to AWS Account ID: ${result.targetAccountId}`,
          targetAccountId: result.targetAccountId,
        }),
      };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: "Endpoint Not Found" }) };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, message: (error as Error).message }),
    };
  }
};