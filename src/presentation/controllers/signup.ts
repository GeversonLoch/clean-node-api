import { IHttpRequest, IHttpResponse } from '../protocols/http'
import { MissingParamError } from '../errors/missing-param-error'
import { badRequest, internalServerError, success } from '../helpers/http-helper'
import { IController } from '../protocols/controller'
import { IEmailValidator } from '../protocols/email-validator'
import { InvalidParamError } from '../errors/invalid-param-error'
import { IAddAccountService } from '../../domain/usecases/add-account'

export class SignUpController implements IController {

  private readonly emailValidator: IEmailValidator
  private readonly addAccountService: IAddAccountService

  constructor(
    emailValidator: IEmailValidator,
    addAccountService: IAddAccountService
  ) {
    this.emailValidator = emailValidator
    this.addAccountService = addAccountService
  }

  handle (httpRequest: IHttpRequest): IHttpResponse {
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

      const account = this.addAccountService.add({
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