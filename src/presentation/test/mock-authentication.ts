import { IAuthenticationParams } from '@domain/models'
import { IAuthentication } from '@domain/usecases'

export const mockAuthentication = () => {
    class AuthenticationStub implements IAuthentication {
        async auth(authentication: IAuthenticationParams): Promise<string> {
            return Promise.resolve('any_token')
        }
    }
    return new AuthenticationStub()
}
