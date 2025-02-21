import { IHttpRequest, IHttpResponse } from '../protocols/http.interface'
import { MissingParamError } from '../errors/missing-param-error'
import { badRequest, internalServerError, success } from '../helpers/http-helper'
import { IController } from '../protocols/controller.interface'
import { IEmailValidator } from '../protocols/email-validator.interface'
import { InvalidParamError } from '../errors/invalid-param-error'
import { IAddAccount } from '../../domain/usecases/add-account.interface'

export class SignUpController implements IController {

  private readonly emailValidator: IEmailValidator
  private readonly addAccount: IAddAccount

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
      return internalServerError()
    }
  }
}