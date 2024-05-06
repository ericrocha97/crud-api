import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { generateToken } from '../../auth'
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
        },
        async (request, reply) => {
            const requestUser = await authenticate(
                request.headers.authorization
            )

            const newAccessToken = generateToken(requestUser)

            return reply.status(201).send(newAccessToken)
        }
    )
}
