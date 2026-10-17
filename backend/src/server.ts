import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'

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

  const mockServices = [
    {
      id: 'auth-service',
      name: 'Сервис аутентификации (Auth Service)',
      owner: 'Команда безопасности',
      stack: 'Node.js / TypeScript',
      driftStatus: 'in_sync',
      dependenciesCount: 4,
      description: 'Управление пользователями, JWT-сессиями и OAuth2/OIDC провайдерами.',
    },
    {
      id: 'payment-gateway',
      name: 'Платежный шлюз (Payment Gateway)',
      owner: 'Команда биллинга',
      stack: 'Go',
      driftStatus: 'drift_detected',
      dependenciesCount: 7,
      description: 'Обработка транзакций, взаимодействие с эквайрингом и фискализация чеков.',
    },
    {
      id: 'notification-service',
      name: 'Сервис уведомлений (Notification Service)',
      owner: 'Команда платформы',
      stack: 'Python / FastAPI',
      driftStatus: 'in_sync',
      dependenciesCount: 3,
      description: 'Отправка email, push-уведомлений и Telegram-сообщений через брокер сообщений.',
    },
    {
      id: 'archon-core-service',
      name: 'Инженерное ядро (Archon Core)',
      owner: 'Команда платформы',
      stack: 'Go',
      driftStatus: 'in_sync',
      dependenciesCount: 12,
      description: 'AI-native Source of Truth, парсинг архитектурных схем и docs-as-code моделей.',
    },
    {
      id: 'catalog-service',
      name: 'Каталог продуктов (Catalog Service)',
      owner: 'Команда витрины',
      stack: 'Java / Spring Boot',
      driftStatus: 'drift_detected',
      dependenciesCount: 5,
      description: 'Хранение и управление карточками товаров, категориями и остатками.',
    },
    {
      id: 'analytics-aggregator',
      name: 'Агрегатор аналитики (Analytics Aggregator)',
      owner: 'Команда данных',
      stack: 'Python / ClickHouse',
      driftStatus: 'in_sync',
      dependenciesCount: 2,
      description: 'Сбор продуктовых метрик, построение воронок и агрегация событий кликстрима.',
    },
    {
      id: 'inventory-service',
      name: 'Сервис инвентаризации (Inventory Service)',
      owner: 'Команда логистики',
      stack: 'Go',
      driftStatus: 'drift_detected',
      dependenciesCount: 6,
      description: 'Учет складских остатков, бронирование позиций и интеграция с WMS.',
    },
  ]

  fastify.get('/api/services', async () => {
    return mockServices
  })

  fastify.get<{ Params: { id: string } }>('/api/services/:id', async (request, reply) => {
    const { id } = request.params
    const service = mockServices.find((s) => s.id === id)
    if (!service) {
      reply.status(404)
      return { error: 'Not Found', message: `Сервис ${id} не найден` }
    }
    return service
  })

  try {
    await fastify.listen({ port: 5000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()