import { FastifyInstance } from 'fastify'
import { BadRequest } from './routes/_errors/bad-request'
import { ZodError } from 'zod'
import { Unauthorized } from './routes/_errors/unauthorized-request'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
    if (error instanceof ZodError) {
        console.warn(`A ZodError error: ${error.message}`)
        return reply.status(400).send({
            message: 'Error during validation',
            errors: error.flatten().fieldErrors,
        })
    }

    if (error instanceof BadRequest) {
        console.warn(`A BadRequest error: ${error.message}`)
        return reply.status(400).send({ message: error.message })
    }

    if (error instanceof Unauthorized) {
        console.warn(`A Unauthorized error: ${error.message}`)
        return reply.status(401).send({ message: error.message })
    }

    console.warn(`A Internal Server error: ${error.message}`)
    return reply.status(500).send({ message: 'Internal server error!' })
}
