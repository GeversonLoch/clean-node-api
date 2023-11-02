import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingParamError } from '../errors/missing-param-error'

export class SignUpController {
  handle (httpReques: HttpRequest): HttpResponse  {

    if (!httpReques.body.email) {
      return {
        statusCode: 400,
        body: new MissingParamError('e-mail')
      }
    }

    if (!httpReques.body.name) {
      return {
        statusCode: 400,
        body: new MissingParamError('name')
      }
    }

  }
}