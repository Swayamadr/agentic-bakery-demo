#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ControlPlaneStack } from '../lib/control-plane-stack';
import { DataPlaneStack } from '../lib/data-plane-stack';

const app = new cdk.App();

// Use CDK_DEFAULT_ACCOUNT if available, otherwise CDK will infer from active AWS CLI credentials
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || 'eu-west-2',
};

// 1. Central Control Plane Stack
const controlPlane = new ControlPlaneStack(app, 'AgenticBakeryControlPlaneStack', { env });

// 2. Data Plane Stack for Customer Tenant
new DataPlaneStack(app, 'AgenticBakeryDataPlaneStack-UKBank', {
  env,
  tenantId: 'uk-regulated-bank-01',
  controlPlaneAccountId: controlPlane.account,
});