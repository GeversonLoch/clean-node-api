import { IDecrypter } from '@data/protocols'
import { IAccountModel } from '@domain/models'
import { ILoadAccountByToken } from '@domain/usecases'

export class DbLoadAccountByToken implements ILoadAccountByToken {
    constructor(
        private readonly decrypter: IDecrypter,
    ) {}

    async loadByToken(accessToken: string, role?: string): Promise<IAccountModel> {
        await this.decrypter.decrypt(accessToken)
        return null
    }
}
