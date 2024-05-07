import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../../middleware/auth'
import { BadRequest } from '../_errors/bad-request'

export async function deleteTask(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/task/:taskId',
        {
            schema: {
                summary: 'Update a task',
                tags: ['task'],
                params: z.object({
                    taskId: z.string(),
                }),
                response: {
                    202: z.object({}),
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

            const existingTask = await prisma.task.findUnique({
                where: { id: parseInt(taskId) },
            })
            if (!existingTask) {
                throw new BadRequest(`Task not found with ${taskId}`)
            }

            await prisma.task.delete({
                where: {
                    id: parseInt(taskId),
                },
            })

            return reply.status(202).send()
        }
    )
}
