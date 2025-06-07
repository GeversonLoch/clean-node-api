import { AccessDeniedError } from '@presentation/errors'
import { forbidden } from '@presentation/helpers'
import { AuthMiddleware } from '@presentation/middlewares'
import { IHttpRequest } from '@presentation/protocols'

const makeFakeRequest = (): IHttpRequest => ({
    headers: {
        'x-access-token': '',
    },
})

const makeSut = () => {
    // const addSurveyStub = makeAddSurvey()
    const sut = new AuthMiddleware()
    return {
        sut,
        // validationStub,
    }
}

describe('Auth Middleware', () => {
    // Garante que retorne 403 se o x-access-token existir nos cabeçalhos.
    test('Should return 403 if no x-access-token exists in headers', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle({})
        expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
    })
})
