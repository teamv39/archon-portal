import type { CoreServiceClient } from '../clients/coreClient.js'

export interface AppConfig {
  CORE_SERVICE_URL: string
  MOCK_MODE: boolean
}

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig
    coreClient: CoreServiceClient
  }
}
