import { ILoadAccountByEmailRepository } from '@data/protocols'
import { IAuthenticationModel } from '@domain/models'
import { IAuthentication } from '@domain/usecases'

export class DbAuthentication implements IAuthentication {
    private readonly loadAccountByEmailRepository: ILoadAccountByEmailRepository

    constructor(loadAccountByEmailRepository: ILoadAccountByEmailRepository) {
        this.loadAccountByEmailRepository = loadAccountByEmailRepository
    }

    async auth(authentication: IAuthenticationModel): Promise<string> {
        const { email } = authentication
        await this.loadAccountByEmailRepository.load(email)
        return null
    }
}
