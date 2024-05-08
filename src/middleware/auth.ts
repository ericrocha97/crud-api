import { verifyToken } from '../auth'
import { prisma } from '../lib/prisma'
import { UserModel } from '../models/user'
import { Unauthorized } from '../routes/_errors/unauthorized-request'

export async function authenticate(
    authHeader: string | undefined
): Promise<UserModel> {
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Unauthorized('Missing or invalid Authorization header')
    }

    const token = authHeader.split(' ')[1]

    const decodedToken = verifyToken(token)

    if (!decodedToken) {
        throw new Unauthorized('Invalid token')
    }

    const user = await prisma.user.findUnique({
        where: { id: decodedToken.userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
        },
    })
    if (!user) {
        throw new Unauthorized('Missing or invalid Authorization header')
    }

    return user
}
