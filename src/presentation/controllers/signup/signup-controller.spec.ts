import { SignUpController } from "@presentation/controllers"
import { IAccountModel, IAddAccountModel, IAuthenticationModel } from "@domain/models"
import { IAddAccount, IAuthentication } from "@domain/usecases"
import { InternalServerError, MissingParamError } from "@presentation/errors"
import { IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { success, internalServerError, badRequest, forbidden } from "@presentation/helpers"
import { IValidation } from "@presentation/protocols"

interface ISutTypes {
  sut: SignUpController,
  addAccountStub: IAddAccount,
  validationStub: IValidation,
  authenticationStub: IAuthentication,
}

const makeFakeRequest = (): IHttpRequest => ({
  body: {
    name: 'any_name',
    email: 'any_email@email.com',
    password: 'any_password',
    passwordConfirmation: 'any_password'
  }
})

const makeFakeAccount = (): IAccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@email.com',
  password: 'valid_password'
})

const makeFakeServerError = (): IHttpResponse => {
  let fakeError = new Error()
  fakeError.stack = 'any_stack'
  return internalServerError(fakeError)
}

const makeAddAccount = (): IAddAccount => {
  class AddAccountStub implements IAddAccount {
    async add (account: IAddAccountModel): Promise<IAccountModel> {
      return Promise.resolve(makeFakeAccount())
    }
  }
  return new AddAccountStub()
}

const makeValidation = (): IValidation => {
  class ValidationStub implements IValidation {
    validate (input: any): Error {
      return null
    }
  }
  return new ValidationStub()
}

const makeAuthentication = (): IAuthentication => {
  class AuthenticationStub implements IAuthentication {
    async auth(authentication: IAuthenticationModel): Promise<string> {
      return Promise.resolve('any_token')
    }
  }
  return new AuthenticationStub()
}

// sut: System Under Test
const makeSut = (): ISutTypes => {
  const validationStub = makeValidation()
  const addAccountStub = makeAddAccount()
  const authenticationStub = makeAuthentication()
  const sut = new SignUpController(validationStub, addAccountStub, authenticationStub)
  return {
    sut,
    validationStub,
    addAccountStub,
    authenticationStub,
  }
}

describe('SignUp Controller', () => {
  // Deve chamar AddAccount com valores corretos.
  test('Should call AddAccount with correct values', async () => {
    const { sut, addAccountStub } = makeSut()

    // Espionar o método add do AddAccountStub para saber se ele foi chamado com os valores corretos.
    const addSpy = jest.spyOn(addAccountStub, 'add')

    await sut.handle(makeFakeRequest())
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@email.com',
      password: 'any_password'
    })
  })

  // Deve retornar 500 se o AddAccount lançar uma exceção.
  test('Should return 500 if AddAccount throws an exception', async () => {
    const { sut, addAccountStub } = makeSut()

    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
      throw new InternalServerError('internal_server_error')
    })

    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(makeFakeServerError())
  })

  // Deve retornar 403 se o AddAccount retornar nulo.
  test('Should return 403 if AddAccount returns null', async () => {
    const { sut, addAccountStub } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockReturnValueOnce(Promise.resolve(null))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(forbidden('O email informado está em uso!'))
  })

  // Deve retornar 200 se dados válidos forem fornecidos.
  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(success({
      token: 'any_token',
    }))
  })

  // Deve chamar Validation com o valore correto.
  test('Should call Validation with correct value', async () => {
    const { sut, validationStub } = makeSut()

    // Espionar o método add do validationStub para saber se ele foi chamado com o valor correto.
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

  // Garante que retorne erro 500 se o Authentication lançar uma exceção.
  test('Should return 500 if Authentication throws an exception', async () => {
    const { sut, authenticationStub } = makeSut()
    jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(
      Promise.reject(new Error())
    )
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(makeFakeServerError())
  })
})
