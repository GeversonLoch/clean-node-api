import { IHttpResponse } from "../protocols/http"
import { IInternalServerError } from "../errors/internal-server-error"

export const badRequest = (error: Error): IHttpResponse => ({
    statusCode: 400,
    body: error
})

export const internalServerError = (): IHttpResponse => ({
    statusCode: 500,
    body: new IInternalServerError()
})