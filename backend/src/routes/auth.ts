import type { FastifyPluginAsync } from 'fastify'
import { loginSchema, type AuthUser } from '../types/auth.js'
import { sessionStorage } from '../utils/sessionStorage.js'
import { verifySession } from '../hooks/verifySession.js'

export const authRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/auth/login', async (request, reply) => {
        const result = loginSchema.safeParse(request.body)
        if (!result.success) {
            return reply.status(400).send({ errors: result.error.issues })
        }

        const { username, password } = result.data

        if (username !== 'admin' || password !== 'password123') {
            // mock
            return reply.status(401).send({ error: 'Неверное имя пользователя или пароль' })
        }
        const user = { id: '1', username, role: 'admin' }

        const existingSessionId = request.cookies.session_id
        if (existingSessionId) {
            sessionStorage.delete(existingSessionId)
        }
        const sessionId = sessionStorage.create(user)

        reply.setCookie('session_id', sessionId, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600 * 24,
        })
        return reply.status(200).send(user)
    })

    fastify.post('/auth/logout', async (request, reply) => {

        const sessionId = request.cookies.session_id
        if (sessionId) {
            sessionStorage.delete(sessionId)
        }
        reply.clearCookie('session_id', { path: '/' })
        return reply.status(200).send({ message: 'Выход выполнен' })
    })

    fastify.get('/auth/me', { preHandler: [verifySession] }, async (request, reply) => {
        return reply.status(200).send(request.user)
    })
}
