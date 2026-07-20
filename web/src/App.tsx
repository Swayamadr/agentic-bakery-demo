import React from 'react';
import { AwsAccountConnect } from './components/AwsAccountConnect';
import { Layers } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="app-shell">
      <header className="top-navbar">
        <div className="brand">
          <Layers className="brand-logo" />
          <span className="brand-title">AGENTIC BAKERY</span>
          <span className="env-tag">CONTROL PLANE v1.0</span>
        </div>
        <div className="user-profile">
          <span className="tenant-id">Tenant: UK-FINANCE-01</span>
        </div>
      </header>

      <main className="content-container">
        <AwsAccountConnect />
      </main>
    </div>
  );
};

export default App;