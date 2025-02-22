import { SignUpController } from "@presentation/controllers"
import { IAccountModel, IAddAccountModel } from "@domain/models"
import { IAddAccount } from "@domain/usecases"
import { InternalServerError, InvalidParamError, MissingParamError } from "@presentation/errors"
import { IEmailValidator } from "@presentation/protocols"

interface ISutTypes {
  sut: SignUpController
  emailValidatorStub: IEmailValidator,
  addAccountStub: IAddAccount
}

const makeEmailValidator = (): IEmailValidator => {
  class EmailValidatorStub implements IEmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const makeAddAccount = (): IAddAccount => {
  class AddAccountStub implements IAddAccount {
    async add (account: IAddAccountModel): Promise<IAccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@email.com',
        password: 'valid_password'
      }
      return Promise.resolve(fakeAccount)
    }
  }
  return new AddAccountStub()
}

// sut: System Under Test
const makeSut = (): ISutTypes => {
  const emailValidatorStub = makeEmailValidator()
  const addAccountStub = makeAddAccount()
  const sut = new SignUpController(emailValidatorStub, addAccountStub)
  return {
    sut,
    emailValidatorStub,
    addAccountStub
  }
}

describe('SignUp Controller', () => {

  // Deve retornar 400 se nenhum nome for fornecido
  test('Should return 400 if no name is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
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
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  // Deve retornar 400 se nenhum email for fornecido.
  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  // Deve retornar 400 se nenhuma senha for fornecida.
  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  // Deve retornar 400 se nenhuma confirmação de senha for fornecida.
  test('Should return 400 if no password confirmation is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  // Deve retornar 400 se a confirmação de senha falhar
  test('Should return 400 if password confirmation fails', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'invalid_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
  })

  // Deve retornar 400 se um e-mail inválido for fornecido.
  test('Should return 400 if an invalid email is provided', async () => {

    const { sut, emailValidatorStub } = makeSut()

    /* Mockar manualmente o EmailValidator com o jest para, nesse caso, retornar false!
       Isso porque é uma boa prática que os stubs retornem true por padrão nos demais testes! */
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  // Deve chamar o EmailValidator com o e-mail correto.
  test('Should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorStub } = makeSut()

    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com', // Garantir que o e-mail passado para o EmailValidator é o da propriedade email do body.
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    await sut.handle(httpRequest)
    expect(isValidSpy).toHaveBeenCalledWith(httpRequest.body.email)
  })

  // Deve retornar 500 se o EmailValidator lançar uma exceção.
  test('Should return 500 if EmailValidator throws an exception', async () => {
    const { sut, emailValidatorStub } = makeSut()

    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new InternalServerError()
    })

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  // Deve chamar AddAccount com valores corretos.
  test('Should call AddAccount with correct values', async () => {
    const { sut, addAccountStub } = makeSut()

    // Espionar o método add do AddAccountStub para saber se ele foi chamado com os valores corretos.
    const addSpy = jest.spyOn(addAccountStub, 'add')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    await sut.handle(httpRequest)
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
      throw new InternalServerError()
    })

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  // Deve retornar 200 se dados válidos forem fornecidos.
  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email@email.com',
        password: 'valid_password',
        passwordConfirmation: 'valid_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@email.com',
      password: 'valid_password'
    })
  })

})
