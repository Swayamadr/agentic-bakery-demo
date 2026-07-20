#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ControlPlaneStack } from '../lib/control-plane-stack';
import { DataPlaneStack } from '../lib/data-plane-stack';

const app = new cdk.App();

// Replace '123456789012' with your real 12-digit AWS Account ID
const env = {
  account: '123456789012', 
  region: 'eu-west-2',
};

// 1. Central Control Plane Stack
const controlPlane = new ControlPlaneStack(app, 'AgenticBakeryControlPlaneStack', { env });

// 2. Customer Data Plane Stack
new DataPlaneStack(app, 'AgenticBakeryDataPlaneStack-UKBank', {
  env,
  tenantId: 'uk-regulated-bank-01',
  controlPlaneAccountId: controlPlane.account,
});