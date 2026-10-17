import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const fastify = Fastify({
    logger: {
    level:'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
        },
    },

    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'body.password',
        'body.token',
        'body.refreshToken',
        '*.password',
      ],
      censor: '[REDACTED]',
    },
  },
})


const start = async () => {

  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
      },
    },
    frameguard: { action: 'deny' },
    noSniff: true,
  })

  await fastify.register(cors, {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Слишком много запросов',
    }),
  })

  //    ====    ====    ====    ====

  fastify.get('/', async () => {
    return { hello: 'world' }
  })

  fastify.get('/health', async () => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  })

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  function getDataFilePath(): string {
    const candidates = [
      path.resolve(__dirname, '../data/mock_mcp_data.json'),
      path.resolve(__dirname, '../../backend/data/mock_mcp_data.json'),
      path.resolve(process.cwd(), 'backend/data/mock_mcp_data.json'),
      path.resolve(process.cwd(), 'data/mock_mcp_data.json'),
    ]
    for (const p of candidates) {
      if (fs.existsSync(p)) return p
    }
    throw new Error(`mock_mcp_data.json not found in candidates: ${candidates.join(', ')}`)
  }

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

  function getServices() {
    const filePath = getDataFilePath()
    const content = fs.readFileSync(filePath, 'utf-8')
    const data: MockDataset = JSON.parse(content)

    const descriptions: Record<string, string> = {
      'order-service': 'Прием и валидация заказов, оркестрация чекаута, вызовы инвентаря, доставки и биллинга.',
      'billing-service': 'Формирование инвойсов, процессинг платежей и публикация событий в брокер сообщений Kafka.',
      'inventory-service': 'Учет товарных остатков, резервирование позиций и валидация наличия на складе.',
      'delivery-service': 'Управление логистикой, расчет слотов доставки и регистрация курьерских заявок.',
      'notification-service': 'Асинхронная отправка транзакционных уведомлений, интеграция с Kafka топиками.',
      'auth-service': 'Централизованная аутентификация, валидация токенов доступа и управление ролями (Tier 0).',
    }

    return data.services.map((s) => {
      const contracts = Object.values(data.contracts).filter((c) => c.service === s.id)
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
        outgoingCalls: s.outgoing_calls,
        contracts,
        endpoints,
      }
    })
  }

  fastify.get('/api/services', async () => {
    return getServices()
  })

  fastify.get<{ Params: { id: string } }>('/api/services/:id', async (request, reply) => {
    const { id } = request.params
    const services = getServices()
    const service = services.find((s) => s.id === id)
    if (!service) {
      reply.status(404)
      return { error: 'Not Found', message: `Сервис ${id} не найден` }
    }
    return service
  })

  fastify.get('/api/contracts', async () => {
    const filePath = getDataFilePath()
    const content = fs.readFileSync(filePath, 'utf-8')
    const data: MockDataset = JSON.parse(content)
    return data.contracts
  })

  try {
    await fastify.listen({ port: 5000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()