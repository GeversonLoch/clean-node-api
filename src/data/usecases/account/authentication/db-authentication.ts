import {
    IHashComparer,
    ILoadAccountByEmailRepository,
    IEncrypter,
    IUpdateAccessTokenRepository,
} from '@data/protocols'
import { IAuthentication } from '@domain/usecases'

export class DbAuthentication implements IAuthentication {
    constructor(
        private readonly loadAccountByEmailRepository: ILoadAccountByEmailRepository,
        private readonly hashComparer: IHashComparer,
        private readonly encrypter: IEncrypter,
        private readonly updateAccessTokenRepository: IUpdateAccessTokenRepository,
    ) {}

    async auth(authentication: IAuthentication.Params): Promise<IAuthentication.Result> {
        const { email, password } = authentication
        const account = await this.loadAccountByEmailRepository.loadByEmail(email)
        if (account) {
            const isValid = await this.hashComparer.compare(password, account.password)
            if (isValid) {
                const accessToken = await this.encrypter.encrypt(account.id)
                await this.updateAccessTokenRepository.updateAccessToken(account.id, accessToken)
                return {
                    accessToken,
                    name: account.name,
                }
            }
        }
        return null
    }
}
