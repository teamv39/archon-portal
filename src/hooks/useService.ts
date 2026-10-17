import { useQuery } from '@tanstack/react-query'
import type { Service } from '@/types/services'

const API_BASE = ''

async function fetchServices(): Promise<Service[]> {
  const res = await fetch(`${API_BASE}/api/services`)
  if (!res.ok) {
    throw new Error('Не удалось загрузить список сервисов')
  }
  return res.json()
}

async function fetchServiceById(id: string): Promise<Service> {
  const res = await fetch(`${API_BASE}/api/services/${id}`)
  if (!res.ok) {
    throw new Error(`Не удалось загрузить сервис ${id}`)
  }
  return res.json()
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  })
}

export function useService(id?: string) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => {
      if (!id) throw new Error('ID сервиса не указан')
      return fetchServiceById(id)
    },
    enabled: Boolean(id),
  })
}