import { IAddAccountRepository, IHasher } from "@data/protocols"
import { IAccountModel, IAddAccountModel } from "@domain/models"
import { IAddAccount } from "@domain/usecases"

export class DbAddAccount implements IAddAccount {
    constructor (
        private readonly hasher: IHasher,
        private readonly addAccountRepository: IAddAccountRepository
    ) {}

    async add(accountData: IAddAccountModel): Promise<IAccountModel> {
        const hashed_password = await this.hasher.hash(accountData.password)
        const account = await this.addAccountRepository.add(Object.assign({}, accountData, { password: hashed_password }))
        return new Promise(resolve => resolve(account))
    }

}