import { z } from 'zod'

export const CreateUserSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    password: z.string(),
})

export const LoginUserSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const UserUserSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
})

export interface UserModel {
    id: number
    firstName: string
    lastName: string
    email: string
}
