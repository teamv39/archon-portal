import { useQuery } from '@tanstack/react-query'
import type { DiagramResponse } from '@/types/diagram'
import { apiFetch } from '@/lib/api-client'

export function useDiagram() {
  return useQuery({
    queryKey: ['diagram', 'c4'],
    queryFn: () => apiFetch<DiagramResponse>('/api/diagrams/c4'),
  })
}
