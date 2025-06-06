import { IAuthenticationModel } from "@domain/models"
import { IAuthentication } from "@domain/usecases"
import { LoginController } from "@presentation/controllers"
import { MissingParamError } from "@presentation/errors"
import { badRequest, internalServerError, success, unauthorized } from "@presentation/helpers"
import { IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { IValidation } from "@presentation/protocols"

const makeFakeRequest = (): IHttpRequest => ({
    body: {
        email: 'any_email@email.com',
        password: 'any_password',
    }
})

const makeFakeServerError = (): IHttpResponse => {
    let fakeError = new Error()
    fakeError.stack = 'any_stack'
    return internalServerError(fakeError)
}

const makeAuthentication = () => {
    class AuthenticationStub implements IAuthentication {
        async auth(authentication: IAuthenticationModel): Promise<string> {
            return new Promise(resolve => resolve('any_token'))
        }
    }
    return new AuthenticationStub()
}

const makeValidation = (): IValidation => {
  class ValidationStub implements IValidation {
    validate (input: any): Error {
      return null
    }
  }
  return new ValidationStub()
}

// sut: System Under Test
const makeSut = () => {
    const authenticationStub = makeAuthentication()
    const validationStub = makeValidation()
    const sut = new LoginController(validationStub, authenticationStub)
    return {
        sut,
        authenticationStub,
        validationStub,
    }
}

describe('Login Controller', () => {
    // Garante que chame o Authentication com os valores corretos.
    test('Should call Authentication with correct values', async () => {
        const { sut, authenticationStub } = makeSut()
        const authSpy = jest.spyOn(authenticationStub, 'auth')
        const request = makeFakeRequest()
        await sut.handle(request)
        expect(authSpy).toHaveBeenCalledWith({
          email: request.body.email,
          password: request.body.password,
        })
    })

    // Garante que retorne erro 401 se credenciais inválidas forem fornecidas.
    test('Should return 401 if invalid credentials are provided', async () => {
        const { sut, authenticationStub } = makeSut()
        jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(
            Promise.resolve(null) // Return null accessToken
        )
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(unauthorized())
    })

    // Garante que retorne erro 500 se o Authentication lançar uma exceção.
    test('Should return 500 if Authentication throws an exception', async () => {
        const { sut, authenticationStub } = makeSut()
        jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(
            Promise.reject(new Error())
        )
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(makeFakeServerError())
    })

    // Garante que retorne erro 200 se credenciais validas forem fornecidas.
    test('Should return 200 if valid credentials are provided', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(success({
            token: 'any_token',
        }))
    })

    // Deve chamar Validation com o valore correto.
    test('Should call Validation with correct value', async () => {
      const { sut, validationStub } = makeSut()
      const validateSpy = jest.spyOn(validationStub, 'validate')
      const httpRequest = makeFakeRequest()
      await sut.handle(httpRequest)
      expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
    })

    // Deve retornar 400 se Validation retornar um erro.
    test('Should return 400 if Validation returns an error', async () => {
      const { sut, validationStub } = makeSut()
      jest.spyOn(validationStub, 'validate').mockReturnValueOnce(
        new MissingParamError('any_field')
      )
      const httpRequest = {
        body: {
          name: 'valid_name',
          email: 'valid_email@email.com',
          password: 'valid_password',
          passwordConfirmation: 'valid_password'
        }
      }
      const httpResponse = await sut.handle(httpRequest)
      expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
    })
})