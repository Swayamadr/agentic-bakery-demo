import React, { useState } from 'react';

interface AgentDeployerProps {
  connectionData?: {
    assumedRoleArn?: string;
    region?: string;
    tenantId?: string;
    storageResult?: any;
  };
  onDeploymentSuccess?: (data: any) => void;
}

export const AgentDeployer: React.FC<AgentDeployerProps> = ({
  connectionData,
  onDeploymentSuccess,
}) => {
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const handleDeployAgent = async () => {
    setDeploying(true);
    setLogs([]);
    
    const targetRegion = connectionData?.region || 'eu-west-2';
    const targetTenant = connectionData?.tenantId || 'TENANT-01';

    addLog('Initiating real-time agent deployment sequence...');
    addLog(`Target AWS Region: ${targetRegion}`);
    addLog(`Target Tenant: ${targetTenant}`);

    try {
      addLog('Calling Control Plane API endpoint http://localhost:3000/api/deploy-agent...');

      const response = await fetch('http://localhost:3000/api/deploy-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleArn: connectionData?.assumedRoleArn,
          region: targetRegion,
          tenantId: targetTenant,
          runtime: 'bedrock-agentcore-python3.11',
          memoryTable: `app-session-state-${targetTenant.toLowerCase()}`,
          storageBucket: `app-data-store-${targetTenant.toLowerCase()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || 'Deployment failed during AgentCore container registration.');
      }

      addLog(`Assumed Role Identity: ${data.executionArn || connectionData?.assumedRoleArn || 'Role Verified'}`);
      addLog('Provisioning Amazon Bedrock AgentCore Runtime...');
      addLog(`Linked Session State Table: app-session-state-${targetTenant.toLowerCase()}`);
      addLog(`Linked Data Store Bucket: app-data-store-${targetTenant.toLowerCase()}`);
      addLog('✅ SUCCESS: Agent container registered and running inside VPC data plane!');

      setDeployed(true);

      if (onDeploymentSuccess) {
        onDeploymentSuccess(data);
      }
    } catch (err: any) {
      addLog(`❌ FAILED: ${err.message}`);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', marginTop: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
          2. Deploy Agent to Customer Data Plane
        </h3>
        <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '4px 8px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '6px' }}>
          Region: {connectionData?.region || 'eu-west-2'}
        </span>
      </div>

      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
        AWS cross-account connection verified. Click below to register and execute the agent container within your isolated Amazon Bedrock AgentCore runtime environment.
      </p>

      <button
        onClick={handleDeployAgent}
        disabled={deploying || deployed}
        style={{
          padding: '12px 24px',
          backgroundColor: deployed ? '#16a34a' : '#2563eb',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '14px',
          border: 'none',
          borderRadius: '8px',
          cursor: deploying || deployed ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s ease',
        }}
      >
        {deploying ? 'Deploying Container Runtime...' : deployed ? '✅ Agent Deployed & Active' : '🚀 Deploy Agent Now'}
      </button>

      {/* Realtime Telemetry Terminal */}
      {logs.length > 0 && (
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#020617', borderRadius: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#38bdf8' }}>
          <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
            <span>&gt;_ AgentCore Container Deployment Telemetry</span>
            <span>Status: {deployed ? 'ACTIVE' : deploying ? 'DEPLOYING' : 'IDLE'}</span>
          </div>
          {logs.map((log, i) => (
            <p key={i} style={{ margin: '4px 0', color: log.includes('✅') ? '#4ade80' : log.includes('❌') ? '#f87171' : '#e2e8f0' }}>
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentDeployer;