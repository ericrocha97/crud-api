import { z } from 'zod'
import { TaskStatus as PrismaTaskStatus } from '@prisma/client'

export const CreateTaskSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    assigneeId: z.number().optional(),
    boardId: z.number(),
})

enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

export const UpdateTaskSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    assigneeId: z.number().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    boardId: z.number().optional(),
})

export const ResponseTaskSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    dueDate: z.date().nullable(),
    status: z.nativeEnum(PrismaTaskStatus),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),
    createdBy: z.string(),
    updatedBy: z.string().nullable(),
    assignee: z
        .object({
            email: z.string(),
            firstName: z.string(),
            lastName: z.string(),
        })
        .nullable(),
    board: z
        .object({
            id: z.number(),
            name: z.string(),
        })
        .nullable(),
})

export const ResponseListTaskSchema = z.array(ResponseTaskSchema)
