export class SignUpController {
  handle (httpReques: any): any  {

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