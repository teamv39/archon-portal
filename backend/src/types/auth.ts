import { z } from 'zod'

export const loginSchema = z.object({
    username: z.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
    password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
})

export type LoginInput = z.infer<typeof loginSchema>

export interface AuthUser {
    id: string
    username: string
    role: string
}

declare module 'fastify' {
    interface FastifyRequest {
        user?: AuthUser
    }
}
