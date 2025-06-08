import { ILoadAccountByToken } from '@domain/usecases'
import { AccessDeniedError } from '@presentation/errors'
import { forbidden, success } from '@presentation/helpers'
import { IHttpRequest, IHttpResponse, IMiddleware } from '@presentation/protocols'

export class AuthMiddleware implements IMiddleware {
    constructor(private readonly loadAccountByToken: ILoadAccountByToken) {}

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const accessToken = httpRequest.headers?.['x-access-token']
        if (accessToken) {
            const account = await this.loadAccountByToken.loadByToken(accessToken)
            if (account) {
                return success({
                    accountId: account.id,
                })
            }
        }
        return forbidden(new AccessDeniedError())
    }
}
