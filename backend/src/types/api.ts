export type DriftStatus = 'in_sync' | 'drift_detected';
export type DocStatus = 'DOCUMENTED' | 'NEEDS_UPDATE' | 'UNDOCUMENTED';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Обертка для пагинации на будущее
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}


// Сервисы, зависимости и контракты
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


// Находки

export type FindingStatus = 'NEW' | 'CONFIRMED' | 'RISK_ACCEPTED' | 'FALSE_POSITIVE';

export interface FindingEvidence {
  docFile?: string;
  docQuote?: string;
  codeFile?: string;
  codeLines?: string;
  codeSnippet?: string;
  verdict: string;
}

export interface Finding {
  id: string;
  serviceId: string;
  title: string;
  category: string;
  severity: Severity;
  status: FindingStatus;
  createdAt: string;
  evidence: FindingEvidence;
}

// Моковый граф c4

export interface DiagramNode {
  id: string;
  title: string;
  type: 'service' | 'database' | 'queue';
  tier?: number;
  driftStatus?: DriftStatus;
}

export interface DiagramEdge {
  source: string;
  target: string;
  protocol: string;
  isDrift: boolean;
  label?: string;
}

export interface DiagramResponse {
  viewId: string;
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
