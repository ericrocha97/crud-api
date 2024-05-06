import { z } from 'zod'
import { TaskStatus as PrismaTaskStatus } from '@prisma/client'

export const CreateTaskSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    assigneeId: z.number().optional(),
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
})

export const ResponseTaskSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    dueDate: z.date().nullable(),
    status: z.nativeEnum(PrismaTaskStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
    createdBy: z.string(),
    updatedBy: z.string().nullable(),
    assigneeId: z.number().nullable(),
})
