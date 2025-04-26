import { IHashComparer, ILoadAccountByEmailRepository, ITokenGenerator } from '@data/protocols'
import { IAuthenticationModel } from '@domain/models'
import { IAuthentication } from '@domain/usecases'

export class DbAuthentication implements IAuthentication {
    private readonly loadAccountByEmailRepository: ILoadAccountByEmailRepository
    private readonly hashComparer: IHashComparer
    private readonly tokenGenerator: ITokenGenerator

    constructor(
        loadAccountByEmailRepository: ILoadAccountByEmailRepository,
        hashComparer: IHashComparer,
        tokenGenerator: ITokenGenerator,
    ) {
        this.loadAccountByEmailRepository = loadAccountByEmailRepository
        this.hashComparer = hashComparer
        this.tokenGenerator = tokenGenerator
    }

    async auth(authentication: IAuthenticationModel): Promise<string> {
        const { email, password } = authentication
        const account = await this.loadAccountByEmailRepository.load(email)
        if (account) {
            await this.hashComparer.compare(password, account.password)
            await this.tokenGenerator.generate(account.id)
        }
        return null
    }
}
