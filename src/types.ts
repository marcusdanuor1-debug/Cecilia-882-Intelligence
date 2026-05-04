/**
 * Cecilia 882 Intelligence Engine - Types
 */

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum FlowAction {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK',
  BYPASS = 'BYPASS',
  QUARANTINE = 'QUARANTINE'
}

export interface NetworkFlow {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  port: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  bytes: number;
  packets: number;
  flags: string;
}

export interface AnalysisResult {
  flowId: string;
  anomalyScore: number; // 0 to 1
  severity: AlertSeverity;
  threatType?: string;
  intelligenceNote: string;
  recommendedAction: FlowAction;
}

export interface ThreatMetrics {
  totalFlows: number;
  activeThreats: number;
  avgAnomalyScore: number;
  packetsProcessed: number;
}
