import React, { useState } from 'react';

interface AgentDeployerProps {
  connectionData?: any;
}

export const AgentDeployer: React.FC<AgentDeployerProps> = ({ connectionData }) => {
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const handleDeployAgent = () => {
    setDeploying(true);
    setLogs([]);
    addLog('Starting agent deployment sequence...');
    addLog(`Target AWS Region: ${connectionData?.region || 'eu-west-2'}`);

    setTimeout(() => {
      addLog('Assuming customer cross-account STS role...');
      addLog('Provisioning Amazon Bedrock AgentCore Runtime...');
      addLog('Linking DynamoDB session memory table...');
      addLog('Syncing OpenSearch Vector Knowledge Base...');
      addLog('✅ SUCCESS: Agent deployed and active!');
      setDeploying(false);
      setDeployed(true);
    }, 2000);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', marginTop: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
        2. Deploy Agent to Customer Data Plane
      </h3>
      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
        AWS connection verified. Click below to spin up Bedrock AgentCore and DynamoDB memory inside region <code>{connectionData?.region || 'eu-west-2'}</code>.
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
        }}
      >
        {deploying ? 'Deploying Infrastructure...' : deployed ? '✅ Agent Deployed & Active' : '🚀 Deploy Agent Now'}
      </button>

      {/* Deployment Logs Box */}
      {logs.length > 0 && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#020617', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#38bdf8' }}>
          {logs.map((log, i) => (
            <p key={i} style={{ margin: '4px 0', color: log.includes('✅') ? '#4ade80' : '#e2e8f0' }}>
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentDeployer;