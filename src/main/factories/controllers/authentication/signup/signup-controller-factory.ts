/*
* Responsável por gerar uma instancia do controlador de cadastro de usuários (SignUpController).
*/

import { IController } from '@presentation/protocols'
import { SignUpController } from '@presentation/controllers'
import { makeSignUpValidation } from '@main/factories/controllers/authentication/signup/signup-validation-factory'
import { makeDbAuthentication } from '@main/factories/usecases/account/db-authentication-factory'
import { makeDbAddAccount } from '@main/factories/usecases/account/db-add-account-factory'

export const makeSignUpController = (): IController => {
    return new SignUpController(
        makeSignUpValidation(),
        makeDbAddAccount(),
        makeDbAuthentication(),
    )
}
