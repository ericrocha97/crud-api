import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { Unauthorized } from '../_errors/unauthorized-request'
import { UserUserSchema } from '../../models/user'
import { authenticate } from '../../middleware/auth'
import { CustomRequest } from '../../types/custom-request'

export async function userInfo(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/user-info',
        {
            schema: {
                summary: 'User Information',
                tags: ['auth'],
                response: {
                    200: UserUserSchema,
                    401: z.object({
                        message: z.string(),
                    }),
                    500: z.object({
                        message: z.string(),
                    }),
                },
                security: [{ bearerAuth: [] }],
            },
            preHandler: authenticate,
        },
        async (request: CustomRequest, reply) => {
            const requestUser = request.user

            if (!requestUser) {
                throw new Unauthorized(
                    'Missing or invalid Authorization header'
                )
            }
            const user = await prisma.user.findUnique({
                where: { id: requestUser.userId },
            })
            if (!user) {
                throw new Unauthorized(
                    'Missing or invalid Authorization header'
                )
            }
            return reply.status(200).send({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            })
        }
    )
}
