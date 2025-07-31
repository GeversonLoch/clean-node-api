import { DbLoadAccountByToken } from '@data/usecases'
import { ILoadAccountByToken } from '@domain/usecases'
import { JwtAdapter } from '@infrastructure/cryptography'
import { AccountMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'

export const makeDbLoadAccountByToken = (): ILoadAccountByToken => {
    // TODO: Mover os secrets dos testes para um objeto global!
    const jwtSecretIntegrationTest = 'S1w/bYomPDSl4uEkE9YxvURoetjSrC1dIvp9PZA3/dPkJJEH8y30bzqAVh3VN2c/ta2KE4kugRjasXppDqlbnQ=='
    const jwtAdapter = new JwtAdapter(process.env.JWT_SECRET ?? jwtSecretIntegrationTest)
    const accountMongoRepository = new AccountMongoRepository(mongoDBAdapter)

    return new DbLoadAccountByToken(jwtAdapter, accountMongoRepository)
}
