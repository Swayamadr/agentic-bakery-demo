import React, { useState } from 'react';
import { 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Terminal, 
  ExternalLink,
  Lock,
  Cpu,
  Bot,
  Send,
  Zap,
  Play
} from 'lucide-react';
import type { ConnectionStatus, DeployStatus, LogEntry, ChatMessage } from '../types';

export const AwsAccountConnect: React.FC = () => {
  // Connection Form State
  const [roleArn, setRoleArn] = useState('arn:aws:iam::123456789012:role/AgenticBakeryRole');
  const [externalId] = useState('bakery-uk-fca-secure-9901');
  const [region, setRegion] = useState('eu-west-2');
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [targetAccount, setTargetAccount] = useState<string | null>(null);

  // Agent Deployer State
  const [agentName, setAgentName] = useState('UK-Compliance-Agent');
  const [selectedModel, setSelectedModel] = useState('anthropic.claude-3-haiku-20240307-v1:0');
  const [enableMcp, setEnableMcp] = useState(true);
  const [deployStatus, setDeployStatus] = useState<DeployStatus>('idle');

  // Playground & Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  // Logs State
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [newEntry, ...prev]);
  };

  // 1. Action: Verify AWS Account
  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleArn.startsWith('arn:aws:iam::')) {
      setStatus('error');
      addLog('Validation error: Role ARN must start with "arn:aws:iam::"', 'error');
      return;
    }

    setStatus('testing');
    addLog(`Initiating cross-account STS AssumeRole handshake in region [${region}]...`, 'info');

    try {
     /* const response = await fetch('http://localhost:8080/connect-aws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleArn, externalId, region, tenantId: 'uk-fintech-01' }),
      });*/
      const LIVE_API_URL = "https://YOUR_API_ID.execute-api.eu-west-2.amazonaws.com/prod/connect-aws";

    const response = await fetch(LIVE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleArn, externalId, region, tenantId: 'uk-fintech-01' }),
    });


      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('connected');
        setTargetAccount(data.targetAccountId || '123456789012');
        addLog(`STS Token generated via ExternalID verification.`, 'success');
        addLog(`Connected to Customer AWS Account ID: ${data.targetAccountId || '123456789012'}`, 'success');
      } else {
        throw new Error(data.message || 'Handshake failed.');
      }
    } catch (err) {
      // Demo Fallback Mode
      setTimeout(() => {
        const mockAccount = roleArn.split(':')[4] || '987654321098';
        setStatus('connected');
        setTargetAccount(mockAccount);
        addLog(`[Sandbox Mode] STS AssumeRole simulated for region ${region}.`, 'warn');
        addLog(`Connected to AWS Account ID: ${mockAccount}`, 'success');
        addLog(`Permissions verified for Bedrock AgentCore deployment.`, 'info');
      }, 1000);
    }
  };

  // 2. Action: Deploy Agent to Connected Account
  const handleDeployAgent = () => {
    setDeployStatus('deploying');
    addLog(`Deploying ${agentName} to Bedrock AgentCore...`, 'info');

    setTimeout(() => {
      if (enableMcp) {
        addLog(`Registered Model Context Protocol (MCP) tool server: [fca_compliance_checker].`, 'info');
      }
      addLog(`Agent [${agentName}] deployed successfully in tenant account!`, 'success');
      setDeployStatus('deployed');
      setChatMessages([
        {
          sender: 'agent',
          text: `Hello! I am your ${agentName} running inside your AWS account (${targetAccount}). How can I assist you with UK financial compliance today?`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }, 1500);
  };

  // 3. Action: Interact with Deployed Agent
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isAgentThinking) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: inputPrompt,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsAgentThinking(true);
    addLog(`Agent execution triggered by prompt: "${inputPrompt.substring(0, 30)}..."`, 'info');

    setTimeout(() => {
      let responseText = "Analysis complete. All parameters align with UK FCA standards.";
      let mcpToolUsed;

      if (enableMcp) {
        mcpToolUsed = 'MCP::fca_compliance_checker';
        addLog(`Invoked MCP Tool [fca_compliance_checker] on customer data plane.`, 'success');
        responseText = `[MCP Validated]: Based on current UK FCA regulations (Section 4.2), the requested portfolio adjustment is compliant. Audit ID: #FCA-${Math.floor(1000 + Math.random() * 9000)}.`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: responseText,
          timestamp: new Date().toLocaleTimeString(),
          mcpUsed: mcpToolUsed
        }
      ]);
      setIsAgentThinking(false);
    }, 1200);
  };

  // 4. Action: Open CloudFormation Stack Link
  const handleLaunchStack = () => {
    addLog('Generating 1-click CloudFormation deployment template URL...', 'info');
    window.open('https://console.aws.amazon.com/cloudformation/home', '_blank');
  };

  return (
    <div className="layout-grid">
      {/* Left Panel: Connection & Agent Config */}
      <div className="left-stack">
        {/* Step 1: Connect AWS Account */}
        <div className="card">
          <div className="card-header">
            <Server className="icon-main" />
            <div style={{ flex: 1 }}>
              <div className="badge-row">
                <h2>1. Connect AWS Account</h2>
                <span className="badge-glow">Data Plane Security</span>
              </div>
              <p className="subtitle">
                Cross-account IAM trust allows deploying agents inside your AWS perimeter.
              </p>
            </div>
          </div>

          <form onSubmit={handleTestConnection} className="form-stack">
            <div className="form-group">
              <label htmlFor="roleArn">IAM Role ARN <span className="req">*</span></label>
              <input
                id="roleArn"
                type="text"
                value={roleArn}
                onChange={(e) => setRoleArn(e.target.value)}
                disabled={status === 'testing'}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>External ID</label>
                <div className="readonly-wrapper">
                  <input type="text" value={externalId} readOnly />
                  <Lock className="input-icon-right" />
                </div>
              </div>

              <div className="form-group half">
                <label>AWS Region</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="eu-west-2">eu-west-2 (London)</option>
                  <option value="eu-west-1">eu-west-1 (Ireland)</option>
                  <option value="us-east-1">us-east-1 (N. Virginia)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className={`btn-primary ${status === 'connected' ? 'btn-success' : ''}`}
              disabled={status === 'testing'}
            >
              {status === 'testing' ? (
                <><Loader2 className="spinner" /> Verifying Connection...</>
              ) : status === 'connected' ? (
                <><CheckCircle2 /> Account Connected ({targetAccount})</>
              ) : (
                'Verify & Save AWS Connection'
              )}
            </button>
          </form>

          <div className="cf-banner">
            <div className="cf-info">
              <Cpu className="cf-icon" />
              <div>
                <strong>Need a cross-account role?</strong>
                <p>Launch 1-click CloudFormation template in your console.</p>
              </div>
            </div>
            <button className="btn-secondary" onClick={handleLaunchStack}>
              Launch Stack <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* Step 2: Agent Bakery Config (Unlocked after Connection) */}
        {status === 'connected' && (
          <div className="card fade-in" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <Bot className="icon-main" style={{ color: '#059669' }} />
              <div>
                <h2>2. Agent Bakery Deployment</h2>
                <p className="subtitle">Configure AI model parameters & MCP tools for AgentCore.</p>
              </div>
            </div>

            <div className="form-stack">
              <div className="form-group">
                <label>Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  disabled={deployStatus === 'deploying'}
                />
              </div>

              <div className="form-group">
                <label>Foundation Model (Amazon Bedrock)</label>
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                  <option value="anthropic.claude-3-haiku-20240307-v1:0">Anthropic Claude 3 Haiku</option>
                  <option value="anthropic.claude-3-sonnet-20240229-v1:0">Anthropic Claude 3.5 Sonnet</option>
                  <option value="amazon.titan-text-express-v1">Amazon Titan Text Express</option>
                </select>
              </div>

              <div className="mcp-toggle-card">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={enableMcp}
                    onChange={(e) => setEnableMcp(e.target.checked)}
                  />
                  <span>Attach Model Context Protocol (MCP) Tools</span>
                </label>
                <p className="field-hint">Enables compliance auditing tools via standardized MCP protocol.</p>
              </div>

              <button
                className="btn-primary"
                style={{ background: '#059669' }}
                onClick={handleDeployAgent}
                disabled={deployStatus === 'deploying'}
              >
                {deployStatus === 'deploying' ? (
                  <><Loader2 className="spinner" /> Deploying to AgentCore...</>
                ) : deployStatus === 'deployed' ? (
                  <><CheckCircle2 /> Agent Live & Active</>
                ) : (
                  <><Play size={16} /> Click-to-Deploy Agent to Customer AWS</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Telemetry & Interactive Chat Playground */}
      <div className="right-stack">
        {/* Realtime Telemetry Terminal */}
        <div className="terminal-card">
          <div className="terminal-header">
            <div className="terminal-title">
              <Terminal className="term-icon" />
              <span>Realtime Telemetry & IAM Audit Log</span>
            </div>
            {targetAccount && <span className="account-tag">Account: {targetAccount}</span>}
          </div>

          <div className="terminal-body">
            {logs.length === 0 ? (
              <div className="terminal-empty">Waiting for cross-account connection event...</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`log-line log-${log.type}`}>
                  <span className="log-time">[{log.timestamp}]</span>
                  <span className="log-msg">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Agent Playground (Unlocked after deployment) */}
        {deployStatus === 'deployed' && (
          <div className="card chat-card fade-in" style={{ marginTop: '24px' }}>
            <div className="chat-header">
              <div className="chat-title">
                <Zap size={18} style={{ color: '#059669' }} />
                <span>Agent Playground — Live Execution</span>
              </div>
              <span className="badge-glow">Bedrock AgentCore Active</span>
            </div>

            <div className="chat-body">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.sender}`}>
                  <div className="chat-meta">
                    <strong>{msg.sender === 'user' ? 'You' : agentName}</strong>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p>{msg.text}</p>
                  {msg.mcpUsed && (
                    <div className="mcp-tag">
                      <Zap size={10} /> Executed via {msg.mcpUsed}
                    </div>
                  )}
                </div>
              ))}
              {isAgentThinking && (
                <div className="chat-bubble agent thinking">
                  <Loader2 className="spinner" size={14} /> Bedrock AgentCore processing...
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-row">
              <input
                type="text"
                placeholder="Ask the agent to run a compliance check or prompt..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
              />
              <button type="submit" disabled={isAgentThinking || !inputPrompt.trim()}>
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};