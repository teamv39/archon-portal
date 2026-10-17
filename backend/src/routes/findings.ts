import type { FastifyPluginAsync } from 'fastify'
import { readJsonFixture } from '../utils/dataFile.js'
import type { Finding } from '../types/api.js'

export const findingsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Querystring: {
      status?: string
      serviceId?: string
      severity?: string
    }
  }>('/findings', async (request) => {
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
  })

  fastify.get<{ Params: { id: string } }>('/findings/:id', async (request, reply) => {
    const { id } = request.params
    const findings = readJsonFixture<Finding[]>('mock_findings.json')
    const finding = findings.find((f) => f.id === id)

    if (!finding) {
      reply.status(404)
      return { error: 'Not Found', message: `Находка ${id} не найдена` }
    }

    return finding
  })
}
