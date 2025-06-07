import { AccessDeniedError } from '@presentation/errors'
import { forbidden } from '@presentation/helpers'
import { IHttpRequest, IHttpResponse, IMiddleware } from '@presentation/protocols'

export class AuthMiddleware implements IMiddleware {
    constructor() {}

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        return Promise.resolve(forbidden(new AccessDeniedError()))
    }
}
