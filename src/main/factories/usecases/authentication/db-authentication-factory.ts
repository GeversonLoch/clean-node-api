import { BcryptAdapter, JwtAdapter } from '@infrastructure/cryptography'
import { AccountMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { DbAuthentication } from '@data/usecases'
import { IAuthentication } from '@domain/usecases'

export const makeDbAuthentication = (): IAuthentication => {
    // TODO: Mover os secrets dos testes para um objeto global!
    const jwtSecretIntegrationTest = 'S1w/bYomPDSl4uEkE9YxvURoetjSrC1dIvp9PZA3/dPkJJEH8y30bzqAVh3VN2c/ta2KE4kugRjasXppDqlbnQ=='
    const jwtAdapter = new JwtAdapter(process.env.JWT_SECRET ?? jwtSecretIntegrationTest)
    const bcryptAdapter = new BcryptAdapter(Number(process.env.SALT) ?? 5)
    const accountMongoRepository = new AccountMongoRepository(mongoDBAdapter)
    return new DbAuthentication(
        accountMongoRepository,
        bcryptAdapter,
        jwtAdapter,
        accountMongoRepository,
    )
}
