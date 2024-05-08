import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { ResponseTaskSchema, UpdateTaskSchema } from '../../models/task'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../../middleware/auth'
import { BadRequest } from '../_errors/bad-request'
import { TaskStatus as PrismaTaskStatus } from '@prisma/client'

export async function updateTask(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().put(
        '/task/:taskId',
        {
            schema: {
                summary: 'Update a task',
                tags: ['task'],
                params: z.object({
                    taskId: z.string(),
                }),
                body: UpdateTaskSchema,
                response: {
                    200: ResponseTaskSchema,
                    400: z.object({
                        message: z.string(),
                        errors: z
                            .object({
                                taskId: z.array(z.string()).optional(),
                                title: z.array(z.string()).optional(),
                                description: z.array(z.string()).optional(),
                                dueDate: z.array(z.string()).optional(),
                                assigneeId: z.array(z.string()).optional(),
                                status: z.array(z.string()).optional(),
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
            const { taskId } = request.params
            const {
                title,
                description,
                dueDate: dueDateBody,
                assigneeId,
                status,
                boardId,
            } = request.body

            console.log('Updating task...')
            console.log(`With params: (taskId: ${taskId})`)
            console.log(
                `With body: (title: ${title}, description: ${description}, dueDate: ${dueDateBody}, assigneeId: ${assigneeId}, status: ${status}, boardId: ${boardId})`
            )

            const requestUser = await authenticate(
                request.headers.authorization
            )

            const existingTask = await prisma.task.findUnique({
                where: { id: parseInt(taskId) },
            })
            if (!existingTask) {
                throw new BadRequest(`Task not found with ${taskId}`)
            }

            const dueDate = dueDateBody ? new Date(dueDateBody) : undefined

            let mappedStatus: PrismaTaskStatus | undefined
            if (status) {
                switch (status) {
                    case 'PENDING':
                        mappedStatus = PrismaTaskStatus.PENDING
                        break
                    case 'IN_PROGRESS':
                        mappedStatus = PrismaTaskStatus.IN_PROGRESS
                        break
                    case 'COMPLETED':
                        mappedStatus = PrismaTaskStatus.COMPLETED
                        break
                    default:
                        throw new BadRequest('Invalid status value')
                }
            }

            const updatedTask = await prisma.task.update({
                where: { id: parseInt(taskId) },
                data: {
                    title,
                    description,
                    dueDate,
                    updatedBy: requestUser.email,
                    assigneeId,
                    status: mappedStatus,
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

            console.log('Task updated successfully.')

            return reply.status(200).send(updatedTask)
        }
    )
}
