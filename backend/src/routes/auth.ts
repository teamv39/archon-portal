import type { FastifyPluginAsync } from 'fastify'
import { loginSchema, type AuthUser } from '../types/auth.js'

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
        reply.setCookie('session_id', 'tokenOrId', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600 * 24,
        })
        const user = { id: '1', username, role: 'admin' }
        return reply.status(200).send(user)
    })

    fastify.post('/auth/logout', async (request, reply) => {
        reply.clearCookie('session_id', { path: '/' })
        // Потом надо еще инвалидировать токен в бд и ещё где-либо
        return reply.status(200).send({ message: 'Выход выполнен' })
    })

    fastify.get('/auth/me', async (request, reply) => {
        const sessionId = request.cookies.session_id
        if (!sessionId) {
            return reply.status(401).send({ error: 'Сессия не найдена' })
        }
        // mock
        const user: AuthUser = {
            id: '1',
            username: 'admin',
            role: 'admin',
        }

        return reply.status(200).send(user)
    })
}
