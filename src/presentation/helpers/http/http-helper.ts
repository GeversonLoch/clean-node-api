import { IHttpResponse } from '@presentation/protocols'
import { InternalServerError, UnauthorizedError, ForbiddenError } from '@presentation/errors'

export const badRequest = (error: Error): IHttpResponse => ({
    statusCode: 400,
    body: error
})

export const forbidden = (message: string): IHttpResponse => ({
    statusCode: 403,
    body: new ForbiddenError(message)
})

export const unauthorized = (): IHttpResponse => ({
    statusCode: 401,
    body: new UnauthorizedError()
})

export const internalServerError = (error: Error): IHttpResponse => ({
    statusCode: 500,
    body: new InternalServerError(error.stack)
})

export const success = (data: any): IHttpResponse => ({
    statusCode: 200,
    body: data
})