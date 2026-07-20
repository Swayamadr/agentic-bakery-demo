import { useState } from 'react';
import AwsAccountConnect from './components/AwsAccountConnect';
import AgentDeployer from './components/AgentDeployer';

export const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionData, setConnectionData] = useState<any>(null);

  const handleConnectionSuccess = (data: any) => {
    setConnectionData(data);
    setIsConnected(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 16px' }}>
      <AwsAccountConnect
        tenantId="UK-FINANCE-01"
        onConnectionSuccess={handleConnectionSuccess}
      />

      {isConnected && <AgentDeployer connectionData={connectionData} />}
    </div>
  );
};

export default App;