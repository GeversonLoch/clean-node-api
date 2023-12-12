import { IHttpRequest, IHttpResponse } from '../protocols/http'
import { IMissingParamError } from '../errors/missing-param-error'
import { badRequest, internalServerError } from '../helpers/http-helper'
import { IController } from '../protocols/controller'
import { IEmailValidator } from '../protocols/email-validator'
import { IInvalidParamError } from '../errors/invalid-param-error'

export class SignUpController implements IController {

  private readonly emailValidator: IEmailValidator

  constructor(
    emailValidator: IEmailValidator
  ) {
    this.emailValidator = emailValidator
  }

  handle (httpRequest: IHttpRequest): IHttpResponse {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']

      for (const fild of requiredFields) {
        if (!httpRequest.body[fild]) {
          return badRequest(new IMissingParamError(fild))
        }
      }

      const isValid = this.emailValidator.isValid(httpRequest.body.email)

      if (!isValid) {
        return badRequest(new IInvalidParamError('email'))
      }
    } catch (error) {
      return internalServerError()
    }
  }
}