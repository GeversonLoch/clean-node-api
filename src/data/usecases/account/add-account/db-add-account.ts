import { IAddAccountRepository, ICheckAccountByEmailRepository, IHasher } from '@data/protocols'
import { IAddAccount } from '@domain/usecases'

export class DbAddAccount implements IAddAccount {
    constructor (
        private readonly hasher: IHasher,
        private readonly addAccountRepository: IAddAccountRepository,
        private readonly checkAccountByEmailRepository: ICheckAccountByEmailRepository,
    ) {}

    async add(accountData: IAddAccount.Params): Promise<IAddAccount.Result> {
        const accountExists = await this.checkAccountByEmailRepository.checkByEmail(accountData.email)
        let isValidAccount = false
        if (!accountExists) {
            const hashed_password = await this.hasher.hash(accountData.password)
            isValidAccount = await this.addAccountRepository.add({ ...accountData, password: hashed_password })
        }
        return isValidAccount
    }
}