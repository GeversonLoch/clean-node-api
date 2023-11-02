import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingParamError } from '../errors/missing-param-error'
import { badRequest } from '../helpers/http-helper'

export class SignUpController {
  handle (httpReques: HttpRequest): HttpResponse  {

    if (!httpReques.body.email) {
      return badRequest(new MissingParamError('email'))
    }

    if (!httpReques.body.name) {
      return badRequest(new MissingParamError('name'))
    }

  }
}