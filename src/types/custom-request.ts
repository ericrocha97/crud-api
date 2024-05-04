// src/types/custom-request.ts
import { FastifyRequest } from 'fastify'
import { Payload } from './token-payload'

export interface CustomRequest extends FastifyRequest {
    user?: Payload
}
