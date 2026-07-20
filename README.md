# 🥐 Agentic Bakery — Multi-Tenant AI Agent Control Plane & Data Plane Architecture

> Enterprise-ready AI Agent Click-to-Deploy Platform engineered for UK Regulated Sectors (FCA Compliance, Data Sovereignty, and Multi-Tenant Account Isolation).



## 📌 Executive Summary

**Agentic Bakery** provides a secure, multi-tenant framework for deploying and managing AI agents across isolated customer AWS accounts. Designed specifically for regulated environments (such as UK Financial Conduct Authority compliance standards), the platform strictly segregates administrative orchestration (**Control Plane**) from agent runtime execution and sensitive vector/model data (**Customer Data Plane**).

### Core Architectural Principles
* **Data Sovereignty & Zero Data Leakage:** Customer data, vector embeddings, and Amazon Bedrock Knowledge Bases remain exclusively inside the customer's AWS boundary.
* **Confused Deputy Prevention:** Implements strict AWS STS `AssumeRole` handshakes verified using per-tenant, non-predictable `ExternalId` parameters.
* **Standardized Tool Integration (MCP):** Leverages the Model Context Protocol (MCP) to enforce auditable, policy-bounded tool executions (e.g., `fca_compliance_checker`).
* **Modular Infrastructure as Code (IaC):** 100% defined using **AWS CDK in TypeScript**, separating central orchestration stacks from tenant-side data stacks.