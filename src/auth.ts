import jwt from 'jsonwebtoken'
import { UserModel } from './models/user'
import { TokenModel } from './models/token'
import { Payload } from './types/token-payload'

const jwtKey = process.env.JWT_SECRET_KEY ?? ''

export function generateToken(user: UserModel): TokenModel {
    const payload: Payload = {
        userId: user.id,
        email: user.email,
        name: user.firstName,
    }
    const expiresIn = 3600

    const token = jwt.sign(payload, jwtKey, { expiresIn })

    return {
        token,
        expiresIn,
        tokenType: 'Bearer',
    }
}

export function verifyToken(token: string): Payload | null {
    try {
        const decoded = jwt.verify(token, jwtKey)
        return decoded as Payload
    } catch (error) {
        return null
    }
}
