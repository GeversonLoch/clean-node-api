/*
* Responsável por gerar uma instancia do controlador de cadastro de usuários (SignUpController).
* As dependências necessárias – como a validação de e-mail, a criptografia de senhas 
* e o acesso a dados – são configuradas e injetadas para garantir o funcionamento adequado do
* processo de registro.
*/

import { SignUpController } from "@presentation/controllers"
import { BcryptAdapter } from "@infrastructure/cryptography"
import { AccountMongoRepository, LogMongoRepository } from "@infrastructure/db"
import { mongoDBAdapter } from "@main/config/db-connection"
import { DbAddAccount } from "@data/usecases"
import { IController } from "@presentation/protocols"
import { LogControllerDecorator } from "@main/decorators/log-controller-decorator"
import { makeSignUpValidation } from "@main/factories/signup/signup-validation"

/*
* Configuração e criação do SignUpController para compor o caso de uso de adição de conta.
*/
export const makeSignUpController = (): IController => {
    const salt: number = 12
    const encrypter = new BcryptAdapter(salt)
    const addAccountRepository = new AccountMongoRepository(mongoDBAdapter)
    const addAccount = new DbAddAccount(encrypter, addAccountRepository)
    const signUpController = new SignUpController(addAccount, makeSignUpValidation())
    const logErrorRepository = new LogMongoRepository(mongoDBAdapter)
    return new LogControllerDecorator(signUpController, logErrorRepository)
}
