import { AccessDeniedError } from '@presentation/errors'
import { forbidden, internalServerError, success } from '@presentation/helpers'
import { AuthMiddleware } from '@presentation/middlewares'
import { mockLoadAccountByToken } from '@presentation/test'

const role = 'any_role'

const mockRequest = (): AuthMiddleware.Request => ({
    accessToken: 'any_token',
})

const makeSut = (role?: string) => {
    const loadAccountByTokenStub = mockLoadAccountByToken()
    const sut = new AuthMiddleware(loadAccountByTokenStub, role)
    return {
        sut,
        loadAccountByTokenStub,
    }
}

describe('Auth Middleware', () => {
    // Garante que retorne 403 se o accessToken existir nos cabeçalhos.
    test('Should return 403 if no accessToken exists in headers', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle({})
        expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
    })

    // Garante que LoadAccountByToken seja chamado com accessToken correto.
    test('Should call LoadAccountByToken with coorrect accessToken', async () => {
        const { sut, loadAccountByTokenStub } = makeSut(role)
        const loadSpy = jest.spyOn(loadAccountByTokenStub, 'loadByToken')
        await sut.handle(mockRequest())
        expect(loadSpy).toHaveBeenCalledWith('any_token', role)
    })

    // Garante que retorne 403 se o LoadAccountByToken retornar nulo.
    test('Should return 403 if LoadAccountByToken returns null', async () => {
        const { sut, loadAccountByTokenStub } = makeSut()
        jest.spyOn(loadAccountByTokenStub, 'loadByToken').mockReturnValueOnce(Promise.resolve(null))
        const httpResponse = await sut.handle(mockRequest())
        expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
    })

    // Garante que retorne 200 se o LoadAccountByToken retornar uma conta.
    test('Should return 403 if LoadAccountByToken returns an account', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(mockRequest())
        expect(httpResponse).toEqual(
            success({
                accountId: 'any_id',
            }),
        )
    })

    // Garante que retorna 500 se o LoadAccountByToken lançar uma exceção.
    test('Should return 500 if LoadAccountByToken throws', async () => {
        const { sut, loadAccountByTokenStub } = makeSut()
        jest.spyOn(loadAccountByTokenStub, 'loadByToken').mockImplementationOnce(() => { throw new Error() })
        const httpResponse = await sut.handle(mockRequest())
        expect(httpResponse).toEqual(internalServerError(new Error()))
    })
})
