import { IAddAccountRepository, IHasher, ILoadAccountByEmailRepository } from '@data/protocols'
import { IAddAccount } from '@domain/usecases'

export class DbAddAccount implements IAddAccount {
    constructor (
        private readonly hasher: IHasher,
        private readonly addAccountRepository: IAddAccountRepository,
        private readonly loadAccountByEmailRepository: ILoadAccountByEmailRepository,
    ) {}

    async add(accountData: IAddAccount.Params): Promise<IAddAccount.Result> {
        const accountExists = await this.loadAccountByEmailRepository.loadByEmail(accountData.email)
        let newAccount: IAddAccountRepository.Result = null
        if (!accountExists) {
            const hashed_password = await this.hasher.hash(accountData.password)
            newAccount = await this.addAccountRepository.add({ ...accountData, password: hashed_password })
        }
        return newAccount !== null
    }
}