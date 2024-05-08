import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../../middleware/auth'
import { BadRequest } from '../_errors/bad-request'
import { ResponseBoardSchema } from '../../models/board'

export async function getBoard(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/board/:boardId',
        {
            schema: {
                summary: 'Get a board',
                tags: ['board'],
                params: z.object({
                    boardId: z.string(),
                }),
                response: {
                    200: ResponseBoardSchema,
                    400: z.object({
                        message: z.string(),
                        errors: z
                            .object({
                                taskId: z.array(z.string()).optional(),
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
            const { boardId } = request.params

            console.log('Getting board details...')
            console.log(`With params: (boardId: ${boardId})`)

            await authenticate(request.headers.authorization)

            const board = await prisma.board.findUnique({
                where: { id: parseInt(boardId) },
                select: {
                    id: true,
                    name: true,
                    createdBy: true,
                    updatedBy: true,
                    createdAt: true,
                    updatedAt: true,
                    tasks: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            dueDate: true,
                            status: true,
                            createdAt: true,
                            updatedAt: true,
                            createdBy: true,
                            updatedBy: true,
                            assignee: {
                                select: {
                                    email: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            })
            if (!board) {
                throw new BadRequest(`Board not found with ${boardId}`)
            }

            return reply.status(200).send(board)
        }
    )
}
