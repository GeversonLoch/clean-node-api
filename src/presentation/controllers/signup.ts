import { IController, IEmailValidator, IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { IAddAccount } from "@domain/usecases"
import { InvalidParamError, MissingParamError } from "@presentation/errors"
import { badRequest, internalServerError, success } from "@presentation/helpers"

export class SignUpController implements IController {
  private readonly addAccount: IAddAccount
  private readonly emailValidator: IEmailValidator
  constructor(
    emailValidator: IEmailValidator,
    addAccount: IAddAccount
  ) {
    this.emailValidator = emailValidator
    this.addAccount = addAccount
  }

  async handle (httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
      const { name, email, password, passwordConfirmation } = httpRequest.body

      for (const fild of requiredFields) {
        if (!httpRequest.body[fild]) {
          return badRequest(new MissingParamError(fild))
        }
      }

      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      const isValid = this.emailValidator.isValid(email)

      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }

      const account = await this.addAccount.add({
        name,
        email,
        password
      })

      return success(account)
    } catch (error) {
      return internalServerError(error)
    }
  }
}