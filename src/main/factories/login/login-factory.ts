/*
* Responsável por gerar uma instancia do controlador de login de usuários (LoginController).
*/

import { LoginController } from '@presentation/controllers'
import { BcryptAdapter, JwtAdapter } from '@infrastructure/cryptography'
import { AccountMongoRepository, LogMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { DbAuthentication } from '@data/usecases'
import { IController } from '@presentation/protocols'
import { LogControllerDecorator } from '@main/decorators/log/log-controller-decorator'
import { makeLoginValidation } from '@main/factories/login/login-validation-factory'

export const makeLoginController = (): IController => {
    const salt: number = 12
    const bcryptAdapter = new BcryptAdapter(salt)
    const jwtAdapter = new JwtAdapter('')
    const accountMongoRepository = new AccountMongoRepository(mongoDBAdapter)
    const dbAuthentication = new DbAuthentication(
        accountMongoRepository,
        bcryptAdapter,
        jwtAdapter,
        accountMongoRepository,
    )
    const loginController = new LoginController(dbAuthentication, makeLoginValidation())
    const logErrorRepository = new LogMongoRepository(mongoDBAdapter)
    return new LogControllerDecorator(loginController, logErrorRepository)
}
