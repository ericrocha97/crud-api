import fastify from 'fastify'

import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastifyCors from '@fastify/cors'

import {
    serializerCompiler,
    validatorCompiler,
    jsonSchemaTransform,
    ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from './error-handler'
import { createUser } from './routes/user/create-user'
import { loginUser } from './routes/auth/login-user'
import { refreshToken } from './routes/auth/refresh-token'
import { userInfo } from './routes/auth/user-info'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
    origin: '*',
})

app.register(fastifySwagger, {
    openapi: {
        openapi: '3.0.0',
        info: {
            title: 'crud api',
            description:
                'Especificações da API para o back-end da aplicação crud.',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createUser)
app.register(loginUser)

//auth
app.register(refreshToken)
app.register(userInfo)

app.setErrorHandler(errorHandler)

app.listen({ port: Number(process.env.PORT ?? 3333), host: '0.0.0.0' }).then(
    () => {
        console.log('HTTP server running!')
    }
)
