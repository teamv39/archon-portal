import Fastify, { type FastifyError } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { servicesRoutes } from './routes/services.js'
import { findingsRoutes } from './routes/findings.js'
import { diagramsRoutes } from './routes/diagrams.js'
import { authRoutes } from './routes/auth.js'
import fastifyCookie from '@fastify/cookie'
import fastifyEnv from '@fastify/env'
import { S } from 'fluent-json-schema'
import { Pool } from 'undici'
import { verifySession } from './hooks/verifySession.js'
import { CoreServiceClient } from './clients/coreClient.js'
import { CoreServiceError } from './utils/errors.js'

const fastify = Fastify({
  logger: {
    level: 'info',
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

  const schema = S.object()
    .prop('CORE_SERVICE_URL', S.string().required().default('http://localhost:8080'))
    .prop('MOCK_MODE', S.boolean().default(true))
    .valueOf()

  const options = {
    confKey: 'config',
    schema: schema,
    dotenv: true
  }
  await fastify.register(fastifyEnv, options)

  const coreClient = new CoreServiceClient(fastify.config.CORE_SERVICE_URL)
  fastify.decorate('coreClient', coreClient)
  fastify.addHook('onClose', () => coreClient.close())

  await fastify.register(fastifyCookie, {
    secret: 'my-secret-key', // опционально для подписанных кук
  })

  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof CoreServiceError) {
      return reply.status(error.status).type('application/problem+json').send({
        type: 'https://archon.internal/errors/core-service-error',
        title: error.title,
        status: error.status,
        detail: error.detail,
        instance: request.url,
      })
    }
    const fastifyError = error as FastifyError
    const statusCode = fastifyError.statusCode ?? 500
    const detail = error instanceof Error ? error.message : 'Непредвиденная ошибка сервера'
    const title = error instanceof Error ? error.name : 'Internal Server Error'
    return reply.status(statusCode).type('application/problem+json').send({
      type: 'about:blank',
      title,
      status: statusCode,
      detail,
      instance: request.url,
    })
  })
  
  // test
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

  // Регистрация апи маршрутов
  await fastify.register(authRoutes, { prefix: '/api' })

  await fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', verifySession)

    await protectedRoutes.register(servicesRoutes)
    await protectedRoutes.register(findingsRoutes)
    await protectedRoutes.register(diagramsRoutes)
  }, { prefix: '/api' })

  try {
    await fastify.listen({ port: 5000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()