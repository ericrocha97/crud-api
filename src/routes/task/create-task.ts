import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { CreateTaskSchema, ResponseTaskSchema } from '../../models/task'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../../middleware/auth'

export async function createTask(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/task',
        {
            schema: {
                summary: 'Create a task',
                tags: ['task'],
                body: CreateTaskSchema,
                response: {
                    201: ResponseTaskSchema,
                    400: z.object({
                        message: z.string(),
                        errors: z
                            .object({
                                title: z.array(z.string()).optional(),
                                description: z.array(z.string()).optional(),
                                dueDate: z.array(z.string()).optional(),
                                assigneeId: z.array(z.string()).optional(),
                                boardId: z.array(z.string()).optional(),
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
                title,
                description,
                dueDate: dueDateBody,
                assigneeId,
                boardId,
            } = request.body

            console.log('Creating a new task...')
            console.log(
                `With body:  (title: ${title}, description: ${description}, dueDate: ${dueDateBody}, assigneeId: ${assigneeId}, boardId: ${boardId})`
            )

            const requestUser = await authenticate(
                request.headers.authorization
            )

            const dueDate = dueDateBody ? new Date(dueDateBody) : undefined
            const task = await prisma.task.create({
                data: {
                    title,
                    description,
                    dueDate,
                    createdBy: requestUser.email,
                    assigneeId,
                    boardId,
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
            })

            console.log('Task created successfully.')

            return reply.status(201).send(task)
        }
    )
}
