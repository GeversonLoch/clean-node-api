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

    /*
      NOTE: toBe
      Verifica se um valor é o que você espera.
    */
    expect(httpResponse.statusCode).toBe(400)

    /*
      NOTE: toEqual
      Usado quando você deseja verificar se dois objetos têm o mesmo valor.
      Esse matcher verifica recursivamente a igualdade de todos os campos, em vez de verificar a identidade do objeto.
    */
    expect(httpResponse.body).toEqual(new Error('Missing param: name'))
    
  })
})

/* 
12:20
Pasta 3. SignUp API - Presentation Layer
Aula 1
*/