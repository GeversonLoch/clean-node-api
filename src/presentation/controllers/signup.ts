import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingParamError } from '../errors/missing-param-error'
import { badRequest } from '../helpers/http-helper'

export class SignUpController {
  handle (httpReques: HttpRequest): HttpResponse  {

    const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']

    for (const fild of requiredFields) {
      if (!httpReques.body[fild]) {
        return badRequest(new MissingParamError(fild))
      }
    }

  }
}