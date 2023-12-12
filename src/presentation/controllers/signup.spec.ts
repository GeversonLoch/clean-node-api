import { IMissingParamError } from '../errors/missing-param-error'
import { IInvalidParamError } from '../errors/invalid-param-error'
import { IInternalServerError } from '../errors/internal-server-error'
import { IEmailValidator } from '../protocols/email-validator'
import { SignUpController } from './signup'

interface ISutTypes {
  sut: SignUpController
  emailValidatorStub: IEmailValidator
}

const makeEmailValidator = (): IEmailValidator => {
  class EmailValidatorStub implements IEmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const makeEmailValidatorWithError = (): IEmailValidator => {
  class EmailValidatorStub implements IEmailValidator {
    isValid (email: string): boolean {
      throw new IInternalServerError()
    }
  }
  return new EmailValidatorStub()
}

// sut: System Under Test
const makeSut = (): ISutTypes => {
  const emailValidatorStub = makeEmailValidator()
  const sut = new SignUpController(emailValidatorStub)
  return {
    sut,
    emailValidatorStub
  }
}

describe('SignUp Controller', () => {

  // Deve retornar 400 se nenhum nome for fornecido
  test('Should return 400 if no name is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    /*
      NOTE: toBe
      Verifica se um valor é o que você espera.
    */
    expect(httpResponse.statusCode).toBe(400)
    /*
      NOTE: toEqual
      Usado quando você deseja verificar se dois objetos têm o mesmo valor.
      Esse matcher verifica recursivamente a igualdade de todos os campos,
      em vez de verificar a identidade do objeto.
    */
    expect(httpResponse.body).toEqual(new IMissingParamError('name'))
  })

  // Deve retornar 400 se nenhum email for fornecido.
  test('Should return 400 if no email is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new IMissingParamError('email'))
  })

  // Deve retornar 400 se nenhuma senha for fornecida.
  test('Should return 400 if no password is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new IMissingParamError('password'))
  })

  // Deve retornar 400 se nenhuma confirmação de senha for fornecida.
  test('Should return 400 if no password confirmation is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new IMissingParamError('passwordConfirmation'))
  })

  // Deve retornar 400 se um e-mail inválido for fornecido.
  test('Should return 400 if an invalid email is provided', () => {

    const { sut, emailValidatorStub } = makeSut()

    /* Mockar manualmente o validator com o jest, para nesse caso retornar falso!
    Isso porque é uma boa pratica que Stub's retornem true por padrão nos demais testes! */
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new IInvalidParamError('email'))
  })

  // Deve chamar o EmailValidator com o e-mail correto.
  test('Should call EmailValidator with corret email', () => {
    const { sut, emailValidatorStub } = makeSut()

    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com', // Garantir que o e-mail que está sendo passado para o EmailValidator é o da propriedade email do body.
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    sut.handle(httpRequest)
    expect(isValidSpy).toHaveBeenCalledWith(httpRequest.body.email)
  })

    // Deve retornar 500 se o EmailValidator lançar uma exceção.
    test('Should return 500 if EmailValidator throws an exception', () => {
      const emailValidatorStub = makeEmailValidatorWithError()
      const sut = new SignUpController(emailValidatorStub)

      const httpRequest = {
        body: {
          name: 'any_name',
          email: 'any_email@email.com',
          password: 'any_password',
          passwordConfirmation: 'any_password'
        }
      }
      const httpResponse = sut.handle(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new IInternalServerError())
    })

})