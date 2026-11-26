import type { FastifyPluginAsync } from 'fastify'
import { readJsonFixture } from '../utils/dataFile.js'
import type { DiagramResponse } from '../types/api.js' 

export const diagramsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/diagrams/c4', async () => {
    if (fastify.config.MOCK_MODE) {
      return readJsonFixture<DiagramResponse>('mock_c4_diagram.json')
    }

    const diagram = await fastify.coreClient.getC4Diagram()
    return diagram
  })
}
