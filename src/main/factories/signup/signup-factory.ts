/*
* Responsável por gerar uma instancia do controlador de cadastro de usuários (SignUpController).
*/

import { SignUpController } from "@presentation/controllers"
import { BcryptAdapter } from "@infrastructure/cryptography"
import { AccountMongoRepository, LogMongoRepository } from "@infrastructure/db"
import { mongoDBAdapter } from "@main/config/db-connection"
import { DbAddAccount } from "@data/usecases"
import { IController } from "@presentation/protocols"
import { LogControllerDecorator } from "@main/decorators/log/log-controller-decorator"
import { makeSignUpValidation } from "@main/factories/signup/signup-validation-factory"

export const makeSignUpController = (): IController => {
    const salt: number = 12
    const hasher = new BcryptAdapter(salt)
    const addAccountRepository = new AccountMongoRepository(mongoDBAdapter)
    const addAccount = new DbAddAccount(hasher, addAccountRepository)
    const signUpController = new SignUpController(addAccount, makeSignUpValidation())
    const logErrorRepository = new LogMongoRepository(mongoDBAdapter)
    return new LogControllerDecorator(signUpController, logErrorRepository)
}
