import { useQuery } from '@tanstack/react-query'
import type { DiagramResponse } from '@/types/diagram'

async function fetchC4Diagram(): Promise<DiagramResponse> {
  const res = await fetch('/api/diagrams/c4')
  if (!res.ok) {
    throw new Error('Не удалось загрузить схему архитектуры')
  }
  return res.json()
}

export function useDiagram() {
  return useQuery({
    queryKey: ['diagram', 'c4'],
    queryFn: fetchC4Diagram,
  })
}
