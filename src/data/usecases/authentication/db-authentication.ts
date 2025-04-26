import { IHashComparer, ILoadAccountByEmailRepository } from '@data/protocols'
import { IAuthenticationModel } from '@domain/models'
import { IAuthentication } from '@domain/usecases'

export class DbAuthentication implements IAuthentication {
    private readonly loadAccountByEmailRepository: ILoadAccountByEmailRepository
    private readonly hashComparer: IHashComparer

    constructor(loadAccountByEmailRepository: ILoadAccountByEmailRepository, hashComparer: IHashComparer) {
        this.loadAccountByEmailRepository = loadAccountByEmailRepository
        this.hashComparer = hashComparer
    }

    async auth(authentication: IAuthenticationModel): Promise<string> {
        const { email, password } = authentication
        const account = await this.loadAccountByEmailRepository.load(email)
        if (account) {
            await this.hashComparer.compare(password, account.password)
        }
        return null
    }
}
