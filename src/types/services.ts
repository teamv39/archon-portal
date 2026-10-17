export type DriftStatus = 'in_sync' | 'drift_detected';
export type DocStatus = 'DOCUMENTED' | 'NEEDS_UPDATE' | 'UNDOCUMENTED';

export interface Contract {
  service: string;
  endpoint: string;
  method: string;
  protocol: string;
  description: string;
  docStatus?: DocStatus;
  architectural_constraints?: string[];
  request_body?: Record<string, unknown>;
  response_body?: Record<string, unknown>;
}

export interface OutgoingCall {
  target: string;
  protocol: string;
  contract?: string;
  topic?: string;
  is_defect_cycle?: boolean;
}

export interface Service {
  id: string;
  name: string;
  owner: string;
  stack: string;
  driftStatus: DriftStatus;
  dependenciesCount: number;
  description?: string;
  tier?: number;
  repoUrl?: string;
  docsUrl?: string;
  databases?: string[];
  brokerTopics?: string[];
  outgoingCalls?: OutgoingCall[];
  contracts?: Contract[];
  endpoints?: string[];
}