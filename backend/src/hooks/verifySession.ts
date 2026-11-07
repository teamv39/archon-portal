import type { FastifyRequest, FastifyReply } from 'fastify'
import { sessionStorage } from '../utils/sessionStorage.js'

export async function verifySession(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies.session_id

    if (!sessionId) {
        return reply.status(401).send({ error: 'Сессия не найдена. Требуется вход в систему' })
    }

    const user = sessionStorage.get(sessionId)
    if (!user) {
        return reply.status(401).send({ error: 'Недействительная сессия' })
    }

    request.user = user
}
