import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { LoginUserSchema } from '../../models/user'
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcrypt'
import { Unauthorized } from '../_errors/unauthorized-request'
import { generateToken } from '../../auth'
export async function loginUser(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/login',
        {
            schema: {
                summary: 'User login',
                tags: ['auth'],
                body: LoginUserSchema,
                response: {
                    200: z.object({
                        token: z.string(),
                        tokenType: z.string(),
                        expiresIn: z.number(),
                    }),
                    400: z.object({
                        message: z.string(),
                        errors: z
                            .object({
                                email: z.array(z.string()).optional(),
                                password: z.array(z.string()).optional(),
                            })
                            .optional(),
                    }),
                    401: z.object({
                        message: z.string(),
                    }),
                    500: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { email, password } = request.body

            const user = await prisma.user.findUnique({
                where: { email },
            })

            if (!user || !(await bcrypt.compare(password, user.password))) {
                throw new Unauthorized('Invalid email or password')
            }

            const token = generateToken(user)

            return reply.status(201).send(token)
        }
    )
}
