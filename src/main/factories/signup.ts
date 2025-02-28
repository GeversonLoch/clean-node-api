/*
* Responsável por gerar uma instancia do controlador de cadastro de usuários (SignUpController).
* As dependências necessárias – como a validação de e-mail, a criptografia de senhas 
* e o acesso a dados – são configuradas e injetadas para garantir o funcionamento adequado do
* processo de registro.
*/

import { SignUpController } from "@presentation/controllers"
import { EmailValidatorAdapter } from "@utils/email-validator-adapter"
import { BcryptAdapter } from "@infrastructure/cryptography"
import { AccountMongoRepository, MongoHelper } from "@infrastructure/db"
import { DbAddAccount } from "@data/usecases"
import env from "@main/config/env"

/*
* Configuração e criação do SignUpController para compor o caso de uso de adição de conta.
*/
export const makeSignUpController = (): SignUpController => {
    const salt: number = 12
    const emailValidator = new EmailValidatorAdapter()
    const encrypter = new BcryptAdapter(salt)
    const mongoHelper = new MongoHelper(env.mongoUrl, env.dbName)
    const addAccountRepository = new AccountMongoRepository(mongoHelper)
    const addAccount = new DbAddAccount(encrypter, addAccountRepository)
    return new SignUpController(emailValidator, addAccount)
}
