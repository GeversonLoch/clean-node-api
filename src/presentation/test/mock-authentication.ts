import { IAuthenticationModel, IAuthenticationParams } from '@domain/models'
import { IAuthentication } from '@domain/usecases'

export const mockAuthentication = () => {
    class AuthenticationStub implements IAuthentication {
        async auth(authentication: IAuthenticationParams): Promise<IAuthenticationModel> {
            return Promise.resolve({
                accessToken: 'any_token',
                name: 'any_name',
            })
        }
    }
    return new AuthenticationStub()
}
