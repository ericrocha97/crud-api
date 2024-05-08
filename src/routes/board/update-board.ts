import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../../middleware/auth'
import { ResponseBoardSchema, UpdateBoardSchema } from '../../models/board'
import { BadRequest } from '../_errors/bad-request'

export async function updateBoard(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().put(
        '/board/:boardId',
        {
            schema: {
                summary: 'Update a board',
                tags: ['board'],
                params: z.object({
                    boardId: z.string(),
                }),
                body: UpdateBoardSchema,
                response: {
                    201: ResponseBoardSchema,
                    400: z.object({
                        message: z.string(),
                        errors: z
                            .object({
                                name: z.array(z.string()).optional(),
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
            const { name } = request.body

            console.log('Updating board...')
            console.log(`With params: (boardId: ${boardId})`)
            console.log(`With body: (name: ${name})`)

            const requestUser = await authenticate(
                request.headers.authorization
            )

            const existingBoard = await prisma.board.findUnique({
                where: { id: parseInt(boardId) },
            })
            if (!existingBoard) {
                throw new BadRequest(`Board not found with ${boardId}`)
            }

            const updatedBoard = await prisma.board.update({
                where: { id: parseInt(boardId) },
                data: {
                    name,
                    updatedBy: requestUser.email,
                },
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

            console.log('Board updated successfully.')

            return reply.status(201).send(updatedBoard)
        }
    )
}
