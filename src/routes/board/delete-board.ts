import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { authenticate } from '../../middleware/auth'
import { BadRequest } from '../_errors/bad-request'

export async function deleteBoard(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/board/:boardId',
        {
            schema: {
                summary: 'Delete a board',
                tags: ['board'],
                params: z.object({
                    boardId: z.string(),
                }),
                response: {
                    202: z.object({}),
                    400: z.object({
                        message: z.string(),
                        errors: z
                            .object({
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
            const { boardId } = request.params

            console.log('Deleting board...')
            console.log(`With params: (boardId: ${boardId})`)

            await authenticate(request.headers.authorization)

            const existingBoard = await prisma.board.findUnique({
                where: { id: parseInt(boardId) },
            })
            if (!existingBoard) {
                throw new BadRequest(`Board not found with ${boardId}`)
            }

            await prisma.board.delete({
                where: {
                    id: parseInt(boardId),
                },
            })

            console.log('Board deleted successfully.')

            return reply.status(202).send()
        }
    )
}
