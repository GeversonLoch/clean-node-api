/*
* Responsável por gerar uma instancia do controlador de cadastro de usuários (SignUpController).
*/

import { SignUpController } from "@presentation/controllers"
import { BcryptAdapter, JwtAdapter } from "@infrastructure/cryptography"
import { AccountMongoRepository, LogMongoRepository } from "@infrastructure/db"
import { mongoDBAdapter } from "@main/config/db-connection"
import { DbAddAccount, DbAuthentication } from "@data/usecases"
import { IController } from "@presentation/protocols"
import { LogControllerDecorator } from "@main/decorators/log/log-controller-decorator"
import { makeSignUpValidation } from "@main/factories/signup/signup-validation-factory"

export const makeSignUpController = (): IController => {
    const salt: number = 12
    const bcryptAdapter = new BcryptAdapter(salt)
    const jwtSecretIntegrationTest = 'S1w/bYomPDSl4uEkE9YxvURoetjSrC1dIvp9PZA3/dPkJJEH8y30bzqAVh3VN2c/ta2KE4kugRjasXppDqlbnQ=='
    const accountMongoRepository = new AccountMongoRepository(mongoDBAdapter)
    const dbAddAccount = new DbAddAccount(bcryptAdapter, accountMongoRepository)
    const jwtAdapter = new JwtAdapter(process.env.JWT_SECRET ?? jwtSecretIntegrationTest)
    const dbAuthentication = new DbAuthentication(
        accountMongoRepository,
        bcryptAdapter,
        jwtAdapter,
        accountMongoRepository,
    )
    const signUpController = new SignUpController(makeSignUpValidation(), dbAddAccount, dbAuthentication)
    const logMongoRepository = new LogMongoRepository(mongoDBAdapter)
    return new LogControllerDecorator(signUpController, logMongoRepository)
}
