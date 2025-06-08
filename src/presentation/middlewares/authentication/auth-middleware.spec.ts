import { IAccountModel } from '@domain/models'
import { ILoadAccountByToken } from '@domain/usecases'
import { AccessDeniedError } from '@presentation/errors'
import { forbidden, success } from '@presentation/helpers'
import { AuthMiddleware } from '@presentation/middlewares'
import { IHttpRequest } from '@presentation/protocols'

const makeFakeRequest = (): IHttpRequest => ({
    headers: {
        'x-access-token': 'any_token',
    },
})

const makeFakeAccount = (): IAccountModel => ({
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@email.com',
    password: 'any_password',
})

const makeLoadAccountByTokenStub = (): ILoadAccountByToken => {
    class LoadAccountByToken implements ILoadAccountByToken {
        async loadByToken(accessToken: string, role?: string): Promise<IAccountModel> {
            return Promise.resolve(makeFakeAccount())
        }
    }
    return new LoadAccountByToken()
}

const makeSut = () => {
    const loadAccountByTokenStub = makeLoadAccountByTokenStub()
    const sut = new AuthMiddleware(loadAccountByTokenStub)
    return {
        sut,
        loadAccountByTokenStub,
    }
}

describe('Auth Middleware', () => {
    // Garante que retorne 403 se o x-access-token existir nos cabeçalhos.
    test('Should return 403 if no x-access-token exists in headers', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle({})
        expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
    })

    // Garante que LoadAccountByToken seja chamado com accessToken correto.
    test('Should call LoadAccountByToken with coorrect accessToken', async () => {
        const { sut, loadAccountByTokenStub } = makeSut()
        const loadSpy = jest.spyOn(loadAccountByTokenStub, 'loadByToken')
        await sut.handle(makeFakeRequest())
        expect(loadSpy).toHaveBeenCalledWith('any_token')
    })

    // Garante que retorne 403 se o LoadAccountByToken retornar nulo.
    test('Should return 403 if LoadAccountByToken returns null', async () => {
        const { sut, loadAccountByTokenStub } = makeSut()
        jest.spyOn(loadAccountByTokenStub, 'loadByToken').mockReturnValueOnce(Promise.resolve(null))
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
    })

    // Garante que retorne 200 se o LoadAccountByToken retornar uma conta.
    test('Should return 403 if LoadAccountByToken returns an account', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(
            success({
                accountId: 'any_id',
            }),
        )
    })
})
