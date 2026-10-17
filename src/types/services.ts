export type DriftStatus = 'in_sync' | 'drift_detected';
export interface Service {
  id: string;
  name: string;
  owner: string;
  stack: string;
  driftStatus: DriftStatus;
  dependenciesCount: number;
  description?: string;
}