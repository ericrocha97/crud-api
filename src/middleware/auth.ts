import { FastifyReply } from 'fastify'
import { verifyToken } from '../auth'
import { Unauthorized } from '../routes/_errors/unauthorized-request'
import { CustomRequest } from '../types/custom-request'

export async function authenticate(
    request: CustomRequest,
    reply: FastifyReply
) {
    const authHeader = request.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
        throw new Unauthorized('Missing or invalid Authorization header')
    }

    const token = authHeader.split(' ')[1]

    const decodedToken = verifyToken(token)

    if (!decodedToken) {
        throw new Unauthorized('Invalid token')
    }

    request.user = decodedToken
}
