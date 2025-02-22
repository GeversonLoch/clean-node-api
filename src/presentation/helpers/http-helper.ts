import { IHttpResponse } from "@presentation/protocols"
import { InternalServerError } from "@presentation/errors"

export const badRequest = (error: Error): IHttpResponse => ({
    statusCode: 400,
    body: error
})

export const internalServerError = (): IHttpResponse => ({
    statusCode: 500,
    body: new InternalServerError()
})

export const success = (data: any): IHttpResponse => ({
    statusCode: 200,
    body: data
})