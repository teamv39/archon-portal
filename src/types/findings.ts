export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type FindingStatus = 'NEW' | 'CONFIRMED' | 'RISK_ACCEPTED' | 'FALSE_POSITIVE'

export interface FindingEvidence {
  docFile?: string
  docQuote?: string
  codeFile?: string
  codeLines?: string
  codeSnippet?: string
  verdict: string
}

export interface Finding {
  id: string
  serviceId: string
  title: string
  category: string
  severity: Severity
  status: FindingStatus
  createdAt: string
  evidence: FindingEvidence
  riskAcceptedUntil?: string
  riskReason?: string
}

export interface ResolveFindingPayload {
  id: string
  status: FindingStatus
  reason?: string
  duration?: string
}
