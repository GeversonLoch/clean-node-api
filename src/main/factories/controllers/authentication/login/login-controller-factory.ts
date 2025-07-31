/*
* Responsável por gerar uma instancia do controlador de login de usuários (LoginController).
*/

import { IController } from '@presentation/protocols'
import { LoginController } from '@presentation/controllers'
import { makeLoginValidation } from '@main/factories/controllers/authentication/login/login-validation-factory'
import { makeDbAuthentication } from '@main/factories/usecases/authentication/db-authentication-factory'

export const makeLoginController = (): IController => {
    return new LoginController(
        makeLoginValidation(),
        makeDbAuthentication(),
    )
}
