import { LoginController } from "@presentation/controllers"
import { InvalidParamError, MissingParamError } from "@presentation/errors"
import { badRequest } from "@presentation/helpers"
import { IEmailValidator, IHttpRequest } from "@presentation/protocols"

const makeFakeRequest = (): IHttpRequest => ({
  body: {
    name: 'any_name',
    email: 'any_email@email.com',
    password: 'any_password',
    passwordConfirmation: 'any_password'
  }
})

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true
        }
    }
    return new EmailValidatorStub()
}

// sut: System Under Test
const makeSut = () => {
    const emailValidatorStub = makeEmailValidator()
    const sut = new LoginController(emailValidatorStub)
    return {
        sut,
        emailValidatorStub,
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
})