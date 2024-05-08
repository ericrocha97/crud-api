import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../../middleware/auth'
import { CreateBoardSchema, ResponseBoardSchema } from '../../models/board'

export async function createBoard(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/board',
        {
            schema: {
                summary: 'Create a board',
                tags: ['board'],
                body: CreateBoardSchema,
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
            const { name } = request.body

            console.log('Creating a new board...')
            console.log(`With body: (name: ${name})`)

            const requestUser = await authenticate(
                request.headers.authorization
            )

            const board = await prisma.board.create({
                data: {
                    name,
                    createdBy: requestUser.email,
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

            console.log('Board created successfully.')

            return reply.status(201).send(board)
        }
    )
}
