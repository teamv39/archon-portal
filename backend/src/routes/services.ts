import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { readJsonFixture } from '../utils/dataFile.js'
import type { Service, Contract, MockDataset, MockServiceDetails } from '../types/api.js'

function getServices(): Service[] {
  const data = readJsonFixture<MockDataset>('mock_mcp_data.json')
  const details = readJsonFixture<MockServiceDetails>('mock_service_details.json')

  return data.services.map((s) => {
    const baseContracts: Contract[] = Object.values(data.contracts)
      .filter((c) => c.service === s.id)
      .map((c) => ({ ...c, docStatus: 'DOCUMENTED' as const }))

    const extraContracts: Contract[] = (details.additionalContracts[s.id] || []).map((c) => ({
      service: s.id,
      ...c,
    }))

    const contracts = [...baseContracts, ...extraContracts]
    const endpoints = contracts.map((c) => `${c.method} ${c.endpoint}`)
    const isDrift = s.outgoing_calls.some((c) => c.is_defect_cycle)

    return {
      id: s.id,
      name: s.name,
      owner: s.owner_team,
      stack: `${s.language} / ${s.framework}`,
      driftStatus: isDrift ? 'drift_detected' : 'in_sync',
      dependenciesCount: s.outgoing_calls.length,
      description: details.descriptions[s.id] || `Микросервис ${s.name} (${s.owner_team}).`,
      tier: s.tier,
      repoUrl: s.repo_url,
      docsUrl: `https://archon.internal/docs/${s.id}`,
      databases: details.databases[s.id] || [],
      brokerTopics: details.brokerTopics[s.id] || [],
      outgoingCalls: s.outgoing_calls,
      contracts,
      endpoints,
    }
  })
}

async function getAggregatedService(
  fastify: FastifyInstance,
  id: string
): Promise<Service | null> {
  const [coreService, findings] = await Promise.all([
    fastify.coreClient.getServiceById(id),
    fastify.coreClient.getFindings({ serviceId: id }),
  ])
  if (!coreService) {
    return null
  }
  const details = readJsonFixture<MockServiceDetails>('mock_service_details.json')
  const hasCriticalFindings = (findings ?? []).some(
    (f) => f.severity === 'CRITICAL' && f.status !== 'RISK_ACCEPTED'
  )
  return {
    ...coreService,
    driftStatus: hasCriticalFindings ? 'drift_detected' : 'in_sync',
    databases: details.databases[id] ?? [],
    brokerTopics: details.brokerTopics[id] ?? [],
    contracts: (details.additionalContracts[id] ?? []).map((c) => ({
      service: id,
      ...c,
    })),
  }
}

export const servicesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/services', async () => {
    return getServices()
  })

    fastify.get<{ Params: { id: string } }>('/services/:id', async (request, reply) => {
    const { id } = request.params

    if (fastify.config.MOCK_MODE) {
      const services = getServices()
      const service = services.find((s) => s.id === id)
      if (!service) {
        reply.status(404)
        return { error: 'Not Found', message: `Сервис ${id} не найден` }
      }
      return service
    }

    const service = await getAggregatedService(fastify, id)
    if (!service) {
      reply.status(404)
      return { error: 'Not Found', message: `Сервис ${id} не найден` }
    }
    return service
  })

  fastify.get('/contracts', async () => {
    const data = readJsonFixture<MockDataset>('mock_mcp_data.json')
    return data.contracts
  })
}
