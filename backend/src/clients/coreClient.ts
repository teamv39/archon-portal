import { Pool } from 'undici'
import type { FastifyInstance } from 'fastify'
import { CoreServiceError } from '../utils/errors.js'
import type { Finding, Service, DiagramResponse } from '../types/api.js'

export class CoreServiceClient {
    private pool: Pool
    constructor(coreServiceUrl: string) {
        this.pool = new Pool(coreServiceUrl, {
            connections: 10,
            pipelining: 1,
            keepAliveTimeout: 10_000,
            connectTimeout: 5_000,
        })
    }
    private async request<T>(path: string): Promise<T | null> {
        try {
            const response = await this.pool.request({
                path,
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'user-agent': 'archon-bff',
                },
            })
            if (response.statusCode === 404) {
                return null
            }
            if (response.statusCode >= 400) {
                throw new CoreServiceError(
                    response.statusCode,
                    `Ядро вернуло ошибку со статусом ${response.statusCode}`,
                    'Upstream Error'
                )
            }
            return (await response.body.json()) as T
        } catch (err) {
            this.handleError(err)
        }
    }

    private handleError(err: unknown): never {
        const error = err as { code?: string; name?: string; message?: string }
        if (error.code === 'ECONNREFUSED' || error.name === 'ConnectTimeoutError') {
            throw new CoreServiceError(502, 'Инженерное ядро Archon недоступно или не отвечает', 'Bad Gateway')
        }
        if (err instanceof CoreServiceError) {
            throw err
        }
        throw new CoreServiceError(500, error.message || 'Ошибка взаимодействия с ядром', 'Internal Core Error')
    }

    async getServiceById(id: string) {
        return this.request<Service>(`/api/v1/services/${encodeURIComponent(id)}`)
    }
    async getServices() {
        return this.request<Service[]>('/api/v1/services')
    }
    async getC4Diagram() {
        return this.request<DiagramResponse>('/api/v1/diagrams/c4')
    }
    async getFindings(params?: FindingsFilter) {
        const query = new URLSearchParams()
        if (params?.serviceId) query.set('serviceId', params.serviceId)
        if (params?.status) query.set('status', params.status)
        if (params?.severity) query.set('severity', params.severity)
        const qs = query.toString()

        return this.request<Finding[]>(`/api/v1/findings${qs ? `?${qs}` : ''}`)
    }

    async close() {
        await this.pool.close()
    }
}

interface FindingsFilter {
    serviceId?: string
    status?: string
    severity?: string
}