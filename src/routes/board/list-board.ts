import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../../middleware/auth'
import { ResponseListBoardSchema } from '../../models/board'

export async function listBoard(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/boards',
        {
            schema: {
                summary: 'Get board list',
                tags: ['board'],
                querystring: z.object({
                    createDateFrom: z.string().optional(),
                    createDateTo: z.string().optional(),
                }),
                response: {
                    200: ResponseListBoardSchema,
                    400: z.object({
                        message: z.string(),
                        errors: z
                            .object({
                                createDateFrom: z.array(z.string()).optional(),
                                createDateTo: z.array(z.string()).optional(),
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
                security: [{ bearerAuth: [] }],
            },
        },
        async (request, reply) => {
            const { createDateFrom, createDateTo } = request.query

            console.log('Retrieving board list...')
            console.log(
                `With query parameters: (createDateFrom: ${createDateFrom}, createDateTo: ${createDateTo})`
            )

            await authenticate(request.headers.authorization)

            const boards = await prisma.board.findMany({
                where: {
                    createdAt: {
                        gte: createDateFrom,
                        lte: createDateTo,
                    },
                },
                include: {
                    _count: {
                        select: { tasks: true },
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                },
            })

            return reply.status(200).send(boards)
        }
    )
}
