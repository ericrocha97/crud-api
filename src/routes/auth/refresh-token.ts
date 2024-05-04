import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { Unauthorized } from '../_errors/unauthorized-request'
import { generateToken, verifyToken } from '../../auth'
import { CustomRequest } from '../../types/custom-request'
import { authenticate } from '../../middleware/auth'

export async function refreshToken(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/refresh-token',
        {
            schema: {
                summary: 'Refresh access token',
                tags: ['auth'],
                response: {
                    200: z.object({
                        token: z.string(),
                        tokenType: z.string(),
                        expiresIn: z.number(),
                    }),
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
                throw new Unauthorized('Invalid refresh token')
            }

            const newAccessToken = generateToken(user)

            return reply.status(201).send(newAccessToken)
        }
    )
}
