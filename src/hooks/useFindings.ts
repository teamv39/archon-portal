import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Finding, ResolveFindingPayload } from '@/types/findings'

const LOCAL_STORAGE_OVERRIDES_KEY = 'archon_findings_overrides'

function getLocalOverrides(): Record<string, Partial<Finding>> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_OVERRIDES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalOverrides(overrides: Record<string, Partial<Finding>>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_OVERRIDES_KEY, JSON.stringify(overrides))
  } catch {
    // ignore
  }
}

async function fetchFindings(params?: {
  status?: string
  serviceId?: string
  severity?: string
}): Promise<Finding[]> {
  const query = new URLSearchParams()
  if (params?.status && params.status !== 'ALL') {
    query.set('status', params.status)
  }
  if (params?.serviceId && params.serviceId !== 'all') {
    query.set('serviceId', params.serviceId)
  }
  if (params?.severity && params.severity !== 'all') {
    query.set('severity', params.severity)
  }

  const url = `/api/findings${query.toString() ? `?${query.toString()}` : ''}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Не удалось загрузить список находок')
  }

  const list: Finding[] = await res.json()
  const overrides = getLocalOverrides()

  return list
    .map((item) => {
      const override = overrides[item.id]
      return override ? { ...item, ...override } : item
    })
    .filter((item) => {
      if (params?.status && params.status !== 'ALL' && item.status !== params.status) {
        return false
      }
      return true
    })
}

export function useFindings(filters?: {
  status?: string
  serviceId?: string
  severity?: string
}) {
  return useQuery({
    queryKey: ['findings', filters],
    queryFn: () => fetchFindings(filters),
  })
}

export function useResolveFinding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, reason, duration }: ResolveFindingPayload) => {
      try {
        await fetch(`/api/findings/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, reason, duration }),
        })
      } catch {
        // Fallback for mock backend
      }

      const overrides = getLocalOverrides()
      overrides[id] = {
        status,
        ...(duration ? { riskAcceptedUntil: duration } : {}),
        ...(reason ? { riskReason: reason } : {}),
      }
      saveLocalOverrides(overrides)

      return { id, status, reason, duration }
    },
    onMutate: async ({ id, status, reason, duration }) => {
      await queryClient.cancelQueries({ queryKey: ['findings'] })

      const previousQueries = queryClient.getQueriesData<Finding[]>({ queryKey: ['findings'] })

      queryClient.setQueriesData<Finding[]>({ queryKey: ['findings'] }, (old) => {
        if (!old) return old
        return old.map((finding) => {
          if (finding.id === id) {
            return {
              ...finding,
              status,
              ...(duration ? { riskAcceptedUntil: duration } : {}),
              ...(reason ? { riskReason: reason } : {}),
            }
          }
          return finding
        })
      })

      return { previousQueries }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] })
    },
  })
}
