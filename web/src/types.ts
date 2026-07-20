export type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'error';
export type DeployStatus = 'idle' | 'deploying' | 'deployed' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export interface AgentConfig {
  name: string;
  model: string;
  mcpTools: string[];
}

export interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  mcpUsed?: string;
}