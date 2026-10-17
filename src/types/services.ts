export type DriftStatus = 'in_sync' | 'drift_detected';

export interface Contract {
  service: string;
  endpoint: string;
  method: string;
  protocol: string;
  description: string;
  architectural_constraints?: string[];
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
  outgoingCalls?: OutgoingCall[];
  contracts?: Contract[];
  endpoints?: string[];
}