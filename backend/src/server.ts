import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { servicesRoutes } from './routes/services.js'
import { findingsRoutes } from './routes/findings.js'
import { diagramsRoutes } from './routes/diagrams.js'

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
  await fastify.register(servicesRoutes, { prefix: '/api' })
  await fastify.register(findingsRoutes, { prefix: '/api' })
  await fastify.register(diagramsRoutes, { prefix: '/api' })

  try {
    await fastify.listen({ port: 5000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()