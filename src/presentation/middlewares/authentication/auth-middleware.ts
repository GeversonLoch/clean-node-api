import { ILoadAccountByToken } from '@domain/usecases'
import { AccessDeniedError } from '@presentation/errors'
import { forbidden, internalServerError, success } from '@presentation/helpers'
import { IHttpResponse, IMiddleware } from '@presentation/protocols'

export class AuthMiddleware implements IMiddleware {
    constructor(
        private readonly loadAccountByToken: ILoadAccountByToken,
        private readonly role?: string,
    ) {}

    async handle(request: AuthMiddleware.Request): Promise<IHttpResponse> {
        try {
            const { accessToken } = request
            if (accessToken) {
                const account = await this.loadAccountByToken.loadByToken(accessToken, this.role)
                if (account) {
                    return success({
                        accountId: account.id,
                    })
                }
            }
            return forbidden(new AccessDeniedError())
        } catch (error) {
            if (error.name === 'JsonWebTokenError')
              return forbidden(new AccessDeniedError())

            return internalServerError(error)
        }
    }
}

export namespace AuthMiddleware {
    export type Request = {
        accessToken?: string
    }
}
