import { AuthMiddleware } from '@presentation/middlewares'
import { IMiddleware } from '@presentation/protocols'
import { makeDbLoadAccountByToken } from '@main/factories/usecases/authentication/db-load-account-by-token-factory'

export const makeAuthMiddleware = (role?: string): IMiddleware => {
    return new AuthMiddleware(makeDbLoadAccountByToken(), role)
}
