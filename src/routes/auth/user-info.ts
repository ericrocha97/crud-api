import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { UserUserSchema } from '../../models/user'
import { authenticate } from '../../middleware/auth'

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
        },
        async (request, reply) => {
            const requestUser = await authenticate(
                request.headers.authorization
            )

            console.log('User Info for:', requestUser.email)

            return reply.status(200).send({
                firstName: requestUser.firstName,
                lastName: requestUser.lastName,
                email: requestUser.email,
            })
        }
    )
}
