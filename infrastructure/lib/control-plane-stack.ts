import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class ControlPlaneStack extends cdk.Stack {
  public readonly tenantsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Multi-tenant Single Table Design
    this.tenantsTable = new dynamodb.Table(this, 'AgenticBakeryTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Root project directory path (C:\Users\silpa\OneDrive\Desktop\gentic-bakery-demo)
    const rootDir = path.resolve(__dirname, '../../');

    // Control Plane API Handler
    const apiHandler = new nodejs.NodejsFunction(this, 'ControlPlaneApiHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(rootDir, 'services/control-plane-api/index.ts'),
      handler: 'handler',
      projectRoot: rootDir, // <-- Tells CDK where the parent project root lives!
      depsLockFilePath: path.join(rootDir, 'package-lock.json'), // <-- Points to root lockfile
      environment: {
        TABLE_NAME: this.tenantsTable.tableName,
      },
      bundling: {
        minify: false,
        sourceMap: true,
        target: 'node20',
        externalModules: ['@aws-sdk/*'], // Use AWS SDK provided in Lambda runtime
      },
    });

    this.tenantsTable.grantReadWriteData(apiHandler);

    // API Gateway REST Interface
    const api = new apigateway.RestApi(this, 'ControlPlaneApi', {
      restApiName: 'Agentic Bakery Control Plane API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    const connectResource = api.root.addResource('connect-aws');
    connectResource.addMethod('POST', new apigateway.LambdaIntegration(apiHandler));

    const deployResource = api.root.addResource('deploy-agent');
    deployResource.addMethod('POST', new apigateway.LambdaIntegration(apiHandler));
  }
}