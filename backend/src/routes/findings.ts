import type { FastifyPluginAsync } from 'fastify'
import { readJsonFixture } from '../utils/dataFile.js'
import type { Finding } from '../types/api.js'
import { CoreServiceError } from '../utils/errors.js'

export const findingsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Querystring: {
      status?: string
      serviceId?: string
      severity?: string
    }
  }>('/findings', async (request) => {
    if (fastify.config.MOCK_MODE) {
      const findings = readJsonFixture<Finding[]>('mock_findings.json')
      const { status, serviceId, severity } = request.query

      let result = findings

      if (status && status !== 'ALL') {
        result = result.filter((f) => f.status.toLowerCase() === status.toLowerCase())
      }

      if (serviceId) {
        result = result.filter((f) => f.serviceId === serviceId)
      }

      if (severity) {
        result = result.filter((f) => f.severity.toLowerCase() === severity.toLowerCase())
      }

      return result
    }
    
    const { status, serviceId, severity } = request.query
    const findings = await fastify.coreClient.getFindings({ serviceId, status, severity })

    return findings
  })

  fastify.get<{ Params: { id: string } }>('/findings/:id', async (request, reply) => {
    if (fastify.config.MOCK_MODE) {
      const { id } = request.params
      const findings = readJsonFixture<Finding[]>('mock_findings.json')
      const finding = findings.find((f) => f.id === id)

      if (!finding) {
        throw new CoreServiceError(404, `Находка ${id} не найдена`, 'Not Found')
      }

      return finding
    }

    const { id } = request.params
    const findings = await fastify.coreClient.getFindings()
    const finding = findings.find((f) => f.id === id)

    if (!finding) {
      throw new CoreServiceError(404, `Находка ${id} не найдена`, 'Not Found')
    }

    return finding
  })
}
