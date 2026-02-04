import { SignUpController } from '@presentation/controllers'
import { IAddAccount, IAuthentication } from '@domain/usecases'
import { mockAddAccountParams, mockAuthenticationModel } from '@domain/test'
import { IValidation } from '@presentation/protocols'
import { success, badRequest, forbidden } from '@presentation/helpers'
import { InternalServerError, InvalidCredentialsError, MissingParamError } from '@presentation/errors'
import { mockAddAccount, mockAuthentication, mockInternalServerError, mockValidation } from '@presentation/test'

interface ISutTypes {
  sut: SignUpController,
  addAccountStub: IAddAccount,
  validationStub: IValidation,
  authenticationStub: IAuthentication,
}

const mockRequest = (): SignUpController.Request => ({
  name: 'any_name',
  email: 'any_email@email.com',
  password: 'any_password',
  passwordConfirmation: 'any_password'
})

// sut: System Under Test
const makeSut = (): ISutTypes => {
  const validationStub = mockValidation()
  const addAccountStub = mockAddAccount()
  const authenticationStub = mockAuthentication()
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

    await sut.handle(mockRequest())
    expect(addSpy).toHaveBeenCalledWith(mockAddAccountParams())
  })

  // Deve retornar 500 se o AddAccount lançar uma exceção.
  test('Should return 500 if AddAccount throws an exception', async () => {
    const { sut, addAccountStub } = makeSut()

    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
      throw new InternalServerError('internal_server_error')
    })

    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(mockInternalServerError())
  })

  // Deve retornar 403 se o AddAccount retornar nulo.
  test('Should return 403 if AddAccount returns null', async () => {
    const { sut, addAccountStub } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockReturnValueOnce(Promise.resolve(null))
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(forbidden(new InvalidCredentialsError()))
  })

  // Deve retornar 200 se dados válidos forem fornecidos.
  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(success(mockAuthenticationModel()))
  })

  // Deve chamar Validation com o valore correto.
  test('Should call Validation with correct value', async () => {
    const { sut, validationStub } = makeSut()

    // Espionar o método add do validationStub para saber se ele foi chamado com o valor correto.
    const validateSpy = jest.spyOn(validationStub, 'validate')

    const request = mockRequest()
    await sut.handle(request)
    expect(validateSpy).toHaveBeenCalledWith(request)
  })

  // Deve retornar 400 se Validation retornar um erro.
  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(
      new MissingParamError('any_field')
    )
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })

  // Garante que chame o Authentication com os valores corretos.
  test('Should call Authentication with correct values', async () => {
    const { sut, authenticationStub } = makeSut()
    const authSpy = jest.spyOn(authenticationStub, 'auth')
    const request = mockRequest()
    await sut.handle(request)
    expect(authSpy).toHaveBeenCalledWith({
      email: request.email,
      password: request.password,
    })
  })

  // Garante que retorne erro 500 se o Authentication lançar uma exceção.
  test('Should return 500 if Authentication throws an exception', async () => {
    const { sut, authenticationStub } = makeSut()
    jest.spyOn(authenticationStub, 'auth').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(mockInternalServerError())
  })
})
