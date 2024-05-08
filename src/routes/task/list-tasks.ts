import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { ResponseListTaskSchema } from '../../models/task'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../../middleware/auth'

export async function listTask(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/tasks',
        {
            schema: {
                summary: 'Get task list',
                tags: ['task'],
                querystring: z.object({
                    boardId: z.string(),
                    createDateFrom: z.string().optional(),
                    createDateTo: z.string().optional(),
                    dueDateFrom: z.string().optional(),
                    dueDateTo: z.string().optional(),
                    assigneeTo: z.string().email().optional(),
                }),
                response: {
                    200: ResponseListTaskSchema,
                    400: z.object({
                        message: z.string(),
                        errors: z
                            .object({
                                boardId: z.array(z.string()).optional(),
                                createDateFrom: z.array(z.string()).optional(),
                                createDateTo: z.array(z.string()).optional(),
                                dueDateFrom: z.array(z.string()).optional(),
                                dueDateTo: z.array(z.string()).optional(),
                                assigneeTo: z.array(z.string()).optional(),
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
            const {
                boardId,
                assigneeTo,
                createDateFrom,
                createDateTo,
                dueDateFrom,
                dueDateTo,
            } = request.query

            console.log('Retrieving task list...')
            console.log(
                `With query parameters: (boardId: ${boardId}, assigneeTo: ${assigneeTo}, createDateFrom: ${createDateFrom}, createDateTo: ${createDateTo}, dueDateFrom: ${dueDateFrom}, dueDateTo: ${dueDateTo})`
            )

            await authenticate(request.headers.authorization)

            const tasks = await prisma.task.findMany({
                where: {
                    boardId: parseInt(boardId),
                    createdAt: {
                        gte: createDateFrom,
                        lte: createDateTo,
                    },
                    dueDate: {
                        gte: dueDateFrom,
                        lte: dueDateTo,
                    },
                    assignee: {
                        email: assigneeTo,
                    },
                },
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
                    board: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                },
            })

            return reply.status(200).send(tasks)
        }
    )
}
