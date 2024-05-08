import { z } from 'zod'
import { TaskStatus as PrismaTaskStatus } from '@prisma/client'

export const CreateBoardSchema = z.object({
    name: z.string(),
})

export const UpdateBoardSchema = CreateBoardSchema

export const ResponseBoardSchema = z.object({
    id: z.number(),
    name: z.string(),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),
    createdBy: z.string(),
    updatedBy: z.string().nullable(),
    tasks: z
        .array(
            z
                .object({
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
                })
                .nullable()
        )
        .nullable(),
})

export const ResponseListBoardSchema = z.array(
    z.object({
        id: z.number(),
        name: z.string(),
        createdAt: z.date(),
        updatedAt: z.date().nullable(),
        createdBy: z.string(),
        updatedBy: z.string().nullable(),
        _count: z.object({
            tasks: z.number(),
        }),
    })
)
