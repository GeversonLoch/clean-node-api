import {
    IAddAccountModel,
    IAddAccount,
    IAccountModel,
    IEncrypter,
    IAddAccountRepository,
} from './db-add-account-protocols'

export class DbAddAccount implements IAddAccount {

    private readonly encrypter: IEncrypter;
    private readonly addAccountRepository: IAddAccountRepository;

    constructor (encrypter: IEncrypter, addAccountRepository: IAddAccountRepository) {
        this.encrypter = encrypter
        this.addAccountRepository = addAccountRepository
    }

    async add(accountData: IAddAccountModel): Promise<IAccountModel> {
        const hashed_password = await this.encrypter.encrypt(accountData.password)
        const account = await this.addAccountRepository.add(Object.assign({}, accountData, { password: hashed_password }))
        return new Promise(resolve => resolve(account))
    }

}