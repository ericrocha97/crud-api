import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { CreateUserSchema } from '../../models/user'
import { prisma } from '../../lib/prisma'
import { BadRequest } from '../_errors/bad-request'
import bcrypt from 'bcrypt'
export async function createUser(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/user',
        {
            schema: {
                summary: 'Create an user',
                tags: ['user'],
                body: CreateUserSchema,
                response: {
                    201: z.object({}).optional(),
                    400: z.object({
                        message: z.string(),
                        errors: z
                            .object({
                                firstName: z.array(z.string()).optional(),
                                lastName: z.array(z.string()).optional(),
                                email: z.array(z.string()).optional(),
                                password: z.array(z.string()).optional(),
                            })
                            .optional(),
                    }),
                    500: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { firstName, lastName, email, password } = request.body

            console.log('Creating new user...')

            const userWithSameEmail = await prisma.user.findUnique({
                where: { email },
            })

            if (userWithSameEmail !== null) {
                throw new BadRequest(
                    'Another user with same email already exists.'
                )
            }

            const hashedPassword = await bcrypt.hash(password, 10)

            await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                },
            })

            console.log('Created user successfully.')

            return reply.status(201).send({})
        }
    )
}
