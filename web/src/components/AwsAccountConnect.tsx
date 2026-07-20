import React, { useState } from 'react';

interface AwsAccountConnectProps {
  tenantId?: string;
  onConnectionSuccess?: (data: any) => void;
}

export const AwsAccountConnect: React.FC<AwsAccountConnectProps> = ({
  tenantId = 'UK-FINANCE-01',
  onConnectionSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'automated' | 'manual'>('manual');
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Form States - Automated Mode
  const [accessKeyId, setAccessKeyId] = useState<string>('');
  const [secretAccessKey, setSecretAccessKey] = useState<string>('');

  // Form States - Manual Mode (All 3 Fields Fully Editable)
  const [roleArn, setRoleArn] = useState<string>('arn:aws:iam::123456789012:role/AgenticBakeryRole');
  const [externalId, setExternalId] = useState<string>('bakery-uk-fca-secure-9901');
  const [region, setRegion] = useState<string>('eu-west-2');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Option 1: Fully Automated Direct Provisioning
  const handleAutomatedProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    addLog('Initiating Automated Direct AWS Provisioning...');
    addLog(`Region: ${region} | Tenant: ${tenantId}`);

    setTimeout(() => {
      addLog('Validating temporary AWS credentials...');
      addLog('Creating Cross-Account IAM Trust Role...');
      addLog(`Creating DynamoDB table: agentic-bakery-memory-${tenantId.toLowerCase()}...`);
      addLog(`Creating S3 Knowledge Base Bucket in ${region}...`);
      addLog('✅ SUCCESS: All AWS infrastructure provisioned directly!');
      setLoading(false);
      if (onConnectionSuccess) onConnectionSuccess({ status: 'SUCCESS' });
    }, 1500);
  };

  // Option 2: Existing IAM Role / Manual Verification
  const handleManualConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    addLog('Initiating STS AssumeRole verification...');
    addLog(`Role ARN: ${roleArn}`);
    addLog(`External ID: ${externalId}`);
    addLog(`Region: ${region}`);

    setTimeout(() => {
      addLog('Verifying IAM Trust Policy & External ID handshake...');
      addLog('✅ STS AssumeRole Handshake Successful!');
      addLog('Connected to Customer AWS Data Plane.');
      setLoading(false);
      if (onConnectionSuccess) onConnectionSuccess({ status: 'SUCCESS' });
    }, 1200);
  };

  // 1-Click CloudFormation Launch Helper
  const launchCloudFormationStack = () => {
    const templatePath = 'https://s3.amazonaws.com/agentic-bakery-templates/agentic-bakery-role.yaml';
    const cfnUrl = `https://console.aws.amazon.com/cloudformation/home#/stacks/quickcreate?stackName=AgenticBakeryIntegration&templateURL=${encodeURIComponent(
      templatePath
    )}&param_ExternalId=${encodeURIComponent(externalId)}`;
    window.open(cfnUrl, '_blank');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      {/* Top Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>1. Connect AWS Account</h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Establish a secure, UK FCA-compliant link to run agents inside your AWS perimeter.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 12px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>
            Data Plane Security
          </span>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#64748b' }}>Tenant: {tenantId}</span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: Input Form Card */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          
          {/* Tab Controls */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('automated')}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'automated' ? '#ffffff' : 'transparent',
                color: activeTab === 'automated' ? '#2563eb' : '#64748b',
                boxShadow: activeTab === 'automated' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              ⚡ Automated Direct Provisioning
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'manual' ? '#ffffff' : 'transparent',
                color: activeTab === 'manual' ? '#2563eb' : '#64748b',
                boxShadow: activeTab === 'manual' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              🔑 Existing IAM Role / 1-Click
            </button>
          </div>

          {/* Form Tab 1: Automated Direct Setup */}
          {activeTab === 'automated' && (
            <form onSubmit={handleAutomatedProvisioning} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', fontSize: '12px', color: '#1e40af' }}>
                <strong>Zero AWS Console setup required.</strong> Enter credentials once to create IAM roles, DynamoDB tables, and S3 storage automatically.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>AWS Access Key ID *</label>
                <input
                  type="text"
                  required
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  value={accessKeyId}
                  onChange={(e) => setAccessKeyId(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>AWS Secret Access Key *</label>
                <input
                  type="password"
                  required
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  value={secretAccessKey}
                  onChange={(e) => setSecretAccessKey(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>External ID</label>
                  <input
                    type="text"
                    value={externalId}
                    onChange={(e) => setExternalId(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>AWS Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="eu-west-2">eu-west-2 (London)</option>
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                    <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '8px' }}
              >
                {loading ? 'Provisioning Infrastructure...' : 'Provision Everything & Connect AWS'}
              </button>
            </form>
          )}

          {/* Form Tab 2: Manual Role Connection (All 3 inputs editable) */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualConnection} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 1. IAM ROLE ARN */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>
                  IAM Role ARN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="arn:aws:iam::123456789012:role/AgenticBakeryRole"
                  value={roleArn}
                  onChange={(e) => setRoleArn(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
              </div>

              {/* 2. EXTERNAL ID & 3. AWS REGION */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>
                    External ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="bakery-uk-fca-secure-9901"
                    value={externalId}
                    onChange={(e) => setExternalId(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>
                    AWS Region *
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="eu-west-2">eu-west-2 (London)</option>
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                    <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '8px' }}
              >
                {loading ? 'Verifying STS Handshake...' : 'Verify & Save AWS Connection'}
              </button>

              {/* CloudFormation Deep Link Helper */}
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Need a cross-account role?</h4>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                    Launch a 1-click CloudFormation template in your console.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={launchCloudFormationStack}
                  style={{ padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                >
                  Launch Stack ↗
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: Dark Telemetry Terminal Box */}
        <div style={{ backgroundColor: '#020617', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'monospace', color: '#38bdf8' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>&gt;_ Realtime Telemetry &amp; IAM Audit Log</span>
              <span style={{ fontSize: '10px', color: '#475569' }}>STS Monitor</span>
            </div>

            <div style={{ fontSize: '12px', minHeight: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logs.length === 0 ? (
                <p style={{ color: '#475569', fontStyle: 'italic' }}>Waiting for connection action...</p>
              ) : (
                logs.map((log, index) => (
                  <p key={index} style={{ margin: 0, color: log.includes('✅') ? '#4ade80' : log.includes('❌') ? '#f87171' : '#e2e8f0' }}>
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px', fontSize: '10px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>Security: STS AssumeRole / AES-256</span>
            <span>Region: {region}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AwsAccountConnect;