import { BcryptAdapter } from "@infrastructure/cryptography"
import { AccountMongoRepository } from "@infrastructure/db"
import { mongoDBAdapter } from "@main/config/db-connection"
import { DbAddAccount } from "@data/usecases"
import { IAddAccount } from "@domain/usecases"

export const makeDbAddAccount = (): IAddAccount => {
    const bcryptAdapter = new BcryptAdapter(Number(process.env.SALT) ?? 5)
    const accountMongoRepository = new AccountMongoRepository(mongoDBAdapter)
    return new DbAddAccount(
        bcryptAdapter,
        accountMongoRepository,
        accountMongoRepository,
    )
}
