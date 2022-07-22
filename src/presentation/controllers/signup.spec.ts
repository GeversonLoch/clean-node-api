import { SignUpController } from './signup'

describe('SignUp Controller', () => {
  test('Deve retornar 400 se nenhum nome for fornecido', () => {

    const sut = new SignUpController()

    const httpRequest = {
      body: {
        email: 'any_email',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })
})