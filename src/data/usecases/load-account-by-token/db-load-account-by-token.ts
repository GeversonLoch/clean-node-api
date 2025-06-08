import { IDecrypter, ILoadAccountByTokenRepository } from '@data/protocols'
import { IAccountModel } from '@domain/models'
import { ILoadAccountByToken } from '@domain/usecases'

export class DbLoadAccountByToken implements ILoadAccountByToken {
    constructor(
        private readonly decrypter: IDecrypter,
        private readonly loadAccountByTokenRepository: ILoadAccountByTokenRepository,
    ) {}

    async loadByToken(accessToken: string, role?: string): Promise<IAccountModel> {
        const token = await this.decrypter.decrypt(accessToken)
        if (token) {
            const account = await this.loadAccountByTokenRepository.loadByToken(accessToken, role)
            if (account) {
                return account
            }
        }
        return null
    }
}
