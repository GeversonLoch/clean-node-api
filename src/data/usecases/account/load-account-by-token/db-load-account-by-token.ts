import { IDecrypter, ILoadAccountByTokenRepository } from '@data/protocols'
import { IAccountModel } from '@domain/models'
import { ILoadAccountByToken } from '@domain/usecases'
import { JwtPayload } from 'jsonwebtoken'

export class DbLoadAccountByToken implements ILoadAccountByToken {
    constructor(
        private readonly decrypter: IDecrypter,
        private readonly loadAccountByTokenRepository: ILoadAccountByTokenRepository,
    ) {}

    async loadByToken(accessToken: string, role?: string): Promise<IAccountModel> {
        let decodedToken: string | JwtPayload
        try {
            decodedToken = await this.decrypter.decrypt(accessToken)
        } catch (error) {
            return null
        }
        if (decodedToken) {
            // TODO: O certo não seria verificação por ID? decodedToken.id com loadById?
            const account = await this.loadAccountByTokenRepository.loadByToken(accessToken, role)
            if (account) {
                return account
            }
        }
        return null
    }
}
