import type { FastifyPluginAsync } from 'fastify'
import { readJsonFixture } from '../utils/dataFile.js'
import type { Service, Contract } from '../types/api.js'

interface RawOutgoingCall {
  target: string
  protocol: string
  contract?: string
  topic?: string
  is_defect_cycle?: boolean
}

interface RawContract {
  service: string
  endpoint: string
  method: string
  protocol: string
  description: string
  architectural_constraints?: string[]
}

interface RawService {
  id: string
  name: string
  tier: number
  language: string
  framework: string
  repo_url: string
  owner_team: string
  outgoing_calls: RawOutgoingCall[]
}

interface MockDataset {
  services: RawService[]
  contracts: Record<string, RawContract>
  validate_dependency_scenarios: Record<string, unknown>
}

const descriptions: Record<string, string> = {
  'order-service': 'Прием и валидация заказов, оркестрация чекаута, вызовы инвентаря, доставки и биллинга.',
  'billing-service': 'Формирование инвойсов, процессинг платежей и публикация событий в брокер сообщений Kafka.',
  'inventory-service': 'Учет товарных остатков, резервирование позиций и валидация наличия на складе.',
  'delivery-service': 'Управление логистикой, расчет слотов доставки и регистрация курьерских заявок.',
  'notification-service': 'Асинхронная отправка транзакционных уведомлений, интеграция с Kafka топиками.',
  'auth-service': 'Централизованная аутентификация, валидация токенов доступа и управление ролями (Tier 0).',
}

const databasesMap: Record<string, string[]> = {
  'order-service': ['PostgreSQL 16', 'Redis Cluster'],
  'billing-service': ['PostgreSQL 16'],
  'inventory-service': ['PostgreSQL 16', 'Redis Cache'],
  'delivery-service': ['MongoDB 7.0'],
  'notification-service': ['Redis PubSub'],
  'auth-service': ['PostgreSQL 16', 'HashiCorp Vault'],
}

const brokerTopicsMap: Record<string, string[]> = {
  'order-service': ['order.created', 'order.cancelled'],
  'billing-service': ['order.paid', 'invoice.generated'],
  'inventory-service': ['stock.reserved', 'stock.replenished'],
  'delivery-service': ['delivery.scheduled', 'delivery.completed'],
  'notification-service': ['notifications.dispatched'],
  'auth-service': ['auth.user_logged_in', 'auth.token_revoked'],
}

const additionalContracts: Record<
  string,
  Array<{ endpoint: string; method: string; protocol: string; description: string; docStatus: 'DOCUMENTED' | 'NEEDS_UPDATE' | 'UNDOCUMENTED' }>
> = {
  'order-service': [
    { endpoint: '/api/v1/orders', method: 'POST', protocol: 'REST', description: 'Оформление и валидация нового заказа', docStatus: 'DOCUMENTED' },
    { endpoint: '/api/v1/orders/:id', method: 'GET', protocol: 'REST', description: 'Получение детальной информации о заказе', docStatus: 'DOCUMENTED' },
  ],
  'inventory-service': [
    { endpoint: '/api/v1/stock/reserve', method: 'POST', protocol: 'REST', description: 'Резервирование складских остатков', docStatus: 'DOCUMENTED' },
    { endpoint: '/api/v1/stock/:sku', method: 'GET', protocol: 'REST', description: 'Проверка доступного количества позиции по SKU', docStatus: 'NEEDS_UPDATE' },
  ],
  'notification-service': [
    { endpoint: '/api/v1/notifications/send', method: 'POST', protocol: 'gRPC', description: 'Отправка системных и транзакционных пушей/писем', docStatus: 'DOCUMENTED' },
  ],
  'auth-service': [
    { endpoint: '/api/v1/auth/token', method: 'POST', protocol: 'REST', description: 'Выпуск и обновление JWT токенов доступа', docStatus: 'DOCUMENTED' },
    { endpoint: '/api/v1/auth/validate', method: 'POST', protocol: 'gRPC', description: 'Валидация сессии и проверка прав субъекта', docStatus: 'DOCUMENTED' },
  ],
}

function getServices(): Service[] {
  const data = readJsonFixture<MockDataset>('mock_mcp_data.json')

  return data.services.map((s) => {
    const baseContracts: Contract[] = Object.values(data.contracts)
      .filter((c) => c.service === s.id)
      .map((c) => ({ ...c, docStatus: 'DOCUMENTED' as const }))

    const extraContracts: Contract[] = (additionalContracts[s.id] || []).map((c) => ({
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
      description: descriptions[s.id] || `Микросервис ${s.name} (${s.owner_team}).`,
      tier: s.tier,
      repoUrl: s.repo_url,
      docsUrl: `https://archon.internal/docs/${s.id}`,
      databases: databasesMap[s.id] || [],
      brokerTopics: brokerTopicsMap[s.id] || [],
      outgoingCalls: s.outgoing_calls,
      contracts,
      endpoints,
    }
  })
}

export const servicesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/services', async () => {
    return getServices()
  })

  fastify.get<{ Params: { id: string } }>('/services/:id', async (request, reply) => {
    const { id } = request.params
    const services = getServices()
    const service = services.find((s) => s.id === id)

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
