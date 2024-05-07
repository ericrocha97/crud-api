import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { ResponseTaskSchema } from '../../models/task'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../../middleware/auth'
import { BadRequest } from '../_errors/bad-request'

export async function getTask(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        '/task/:taskId',
        {
            schema: {
                summary: 'Get a task',
                tags: ['task'],
                params: z.object({
                    taskId: z.string(),
                }),
                response: {
                    200: ResponseTaskSchema,
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
            const { taskId } = request.params

            await authenticate(request.headers.authorization)

            const task = await prisma.task.findUnique({
                where: { id: parseInt(taskId) },
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
            if (!task) {
                throw new BadRequest(`Task not found with ${taskId}`)
            }

            return reply.status(200).send(task)
        }
    )
}
