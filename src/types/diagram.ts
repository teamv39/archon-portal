export type DiagramNodeType = 'service' | 'database' | 'queue'

export type DriftStatus = 'in_sync' | 'drift_detected'

export interface DiagramNode {
  id: string
  title: string
  type: DiagramNodeType
  tier?: number
  driftStatus?: DriftStatus
}

export interface DiagramEdge {
  source: string
  target: string
  protocol: string
  isDrift: boolean
  label?: string
}

export interface DiagramResponse {
  viewId: string
  title: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

export type C4ViewLevel = 'context' | 'container' | 'component'
