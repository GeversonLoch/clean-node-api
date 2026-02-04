import { IAuthentication } from '@domain/usecases'

export const mockAuthentication = () => {
    class AuthenticationStub implements IAuthentication {
        async auth(authentication: IAuthentication.Params): Promise<IAuthentication.Result> {
            return Promise.resolve({
                accessToken: 'any_token',
                name: 'any_name',
            })
        }
    }
    return new AuthenticationStub()
}
