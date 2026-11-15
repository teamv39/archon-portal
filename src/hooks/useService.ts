import { useQuery } from '@tanstack/react-query'
import type { Service } from '@/types/services'
import { apiFetch } from '@/lib/api-client'

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => apiFetch<Service[]>('/api/services'),
  })
}

export function useService(id?: string) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => {
      if (!id) throw new Error('ID сервиса не указан')
      return apiFetch<Service>(`/api/services/${id}`)
    },
    enabled: Boolean(id),
  })
}
