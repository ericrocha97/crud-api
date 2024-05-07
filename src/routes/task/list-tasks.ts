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
            const {
                boardId,
                assigneeTo,
                createDateFrom,
                createDateTo,
                dueDateFrom,
                dueDateTo,
            } = request.query
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
