import { IAddAccountRepository, IHasher, ILoadAccountByEmailRepository } from "@data/protocols"
import { IAccountModel, IAddAccountModel } from "@domain/models"
import { IAddAccount } from "@domain/usecases"

export class DbAddAccount implements IAddAccount {
    constructor (
        private readonly hasher: IHasher,
        private readonly addAccountRepository: IAddAccountRepository,
        private readonly loadAccountByEmailRepository: ILoadAccountByEmailRepository,
    ) {}

    async add(accountData: IAddAccountModel): Promise<IAccountModel> {
        const accountExists = await this.loadAccountByEmailRepository.loadByEmail(accountData.email)
        if (!accountExists) {
            const hashed_password = await this.hasher.hash(accountData.password)
            const account = await this.addAccountRepository.add(Object.assign({}, accountData, { password: hashed_password }))
            return account
        }
        return null
    }

}