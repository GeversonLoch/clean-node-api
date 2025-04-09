import { IController, IEmailValidator, IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { IAddAccount } from "@domain/usecases"
import { InvalidParamError, MissingParamError } from "@presentation/errors"
import { badRequest, internalServerError, IValidation, success } from "@presentation/helpers"

export class SignUpController implements IController {
  private readonly addAccount: IAddAccount
  private readonly emailValidator: IEmailValidator
  private readonly validation: IValidation
  constructor(
    emailValidator: IEmailValidator,
    addAccount: IAddAccount,
    validation: IValidation,
  ) {
    this.emailValidator = emailValidator
    this.addAccount = addAccount
    this.validation = validation
  }

  async handle (httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { name, email, password, passwordConfirmation } = httpRequest.body

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