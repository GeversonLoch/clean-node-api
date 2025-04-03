import { IAuthenticator } from "@domain/usecases"
import { LoginController } from "@presentation/controllers"
import { InternalServerError, InvalidParamError, MissingParamError } from "@presentation/errors"
import { badRequest, internalServerError, unauthorizedError } from "@presentation/helpers"
import { IEmailValidator, IHttpRequest, IHttpResponse } from "@presentation/protocols"

const makeFakeRequest = (): IHttpRequest => ({
    body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
    }
})

const makeFakeServerError = (): IHttpResponse => {
    let fakeError = new Error()
    fakeError.stack = 'any_stack'
    return internalServerError(fakeError)
}

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true
        }
    }
    return new EmailValidatorStub()
}

const makeAuthenticator = () => {
    class AuthenticatorStub implements IAuthenticator {
        async auth(email: string, password: string): Promise<string> {
            return new Promise(resolve => resolve('any_token'))
        }
    }
    return new AuthenticatorStub()
}

// sut: System Under Test
const makeSut = () => {
    const emailValidatorStub = makeEmailValidator()
    const authenticatorStub = makeAuthenticator()
    const sut = new LoginController(emailValidatorStub, authenticatorStub)
    return {
        sut,
        emailValidatorStub,
        authenticatorStub,
    }
}

describe('Login Controller', () => {
    // Garante que retorne 400 se nenhum e-mail for fornecido
    test('Should return 400 if no e-mail is provided', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password',
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse).toEqual(badRequest(new MissingParamError('email')))
    })

    // Garante que retorne 400 se o password não for fornecido
    test('Should return 400 if no password is provided', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email',
                passwordConfirmation: 'any_password',
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse).toEqual(badRequest(new MissingParamError('password')))
    })

    // Garante que retorne 400 se um e-mail inválido for fornecido.
    test('Should return 400 if an invalid email is provided', async () => {
        const { sut, emailValidatorStub } = makeSut()

        /* Mockar manualmente o EmailValidator com o jest para, nesse caso, retornar false!
           Isso porque é uma boa prática que os stubs retornem true por padrão nos demais testes! */
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')))
    })

    // Garante que chame o EmailValidator com o e-mail correto.
    test('Should call EmailValidator with correct email', async () => {
        const { sut, emailValidatorStub } = makeSut()

        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

        const httpRequest = makeFakeRequest()
        await sut.handle(httpRequest)
        expect(isValidSpy).toHaveBeenCalledWith(httpRequest.body.email)
    })

    // Garante que retorne erro 500 se o EmailValidator lançar uma exceção.
    test('Should return 500 if EmailValidator throws an exception', async () => {
        const { sut, emailValidatorStub } = makeSut()

        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
            throw new InternalServerError('internal_server_error')
        })

        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(makeFakeServerError())
    })

    // Garante que chame o Authenticator com os valores corretos.
    test('Should call Authenticator with correct values', async () => {
        const { sut, authenticatorStub } = makeSut()

        const authSpy = jest.spyOn(authenticatorStub, 'auth')

        const request = makeFakeRequest()
        await sut.handle(request)
        expect(authSpy).toHaveBeenCalledWith(request.body.email, request.body.password)
    })

    // Garante que retorne erro 401 se credenciais inválidas forem fornecidas.
    test('Should return 401 if invalid credentials are provided', async () => {
        const { sut, authenticatorStub } = makeSut()

        jest.spyOn(authenticatorStub, 'auth').mockReturnValueOnce(
            Promise.resolve(null) // Return null accessToken
        )

        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(unauthorizedError())
    })
})