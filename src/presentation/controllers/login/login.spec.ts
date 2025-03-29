import { LoginController } from "@presentation/controllers"
import { MissingParamError } from "@presentation/errors"
import { badRequest } from "@presentation/helpers"

describe('Login Controller', () => {
    // Garante que retornar 400 se nenhum e-mail for fornecido
    test('Should return 400 if no e-mail is provided', async () => {
        const sut = new LoginController()
        const httpRequest = {
            body: {
              name: 'any_name',
              password: 'any_password',
              passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse).toEqual(badRequest(new MissingParamError('email')))
    })
})