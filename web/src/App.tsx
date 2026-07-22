import React, { useState } from 'react';
import AwsAccountConnect from './components/AwsAccountConnect';
import AgentDeployer from './components/AgentDeployer';

export const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionData, setConnectionData] = useState<any>(null);

  const handleConnectionSuccess = (data: any) => {
    setConnectionData(data);
    setIsConnected(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Top Platform Navigation Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              Enterprise AI Management Platform
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b' }}>
            <span>Control Plane v1.0</span>
            <span style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontFamily: 'monospace' }}>
              Environment: Production
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <AwsAccountConnect
          tenantId="TENANT-01"
          onConnectionSuccess={handleConnectionSuccess}
        />

        {isConnected && (
          <AgentDeployer connectionData={connectionData} />
        )}
      </main>
    </div>
  );
};

export default App;