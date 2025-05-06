import { IHttpResponse } from "@presentation/protocols"
import { InternalServerError, UnauthorizedError } from "@presentation/errors"

export const badRequest = (error: Error): IHttpResponse => ({
    statusCode: 400,
    body: error
})

export const unauthorizedError = (): IHttpResponse => ({
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