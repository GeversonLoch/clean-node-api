import { HttpRequest, HttpResponse } from '../protocols/http'

export class SignUpController {
  handle (httpReques: HttpRequest): HttpResponse  {

    if (!httpReques.body.email) {
      return {
        statusCode: 400,
        body: new Error('Missing param: e-mail')
      }
    }

    if (!httpReques.body.name) {
      return {
        statusCode: 400,
        body: new Error('Missing param: name')
      }
    }

  }
}