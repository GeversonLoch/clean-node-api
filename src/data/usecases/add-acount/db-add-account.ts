import { IAccountModel } from "../../../domain/models/account-model.interface";
import { IAddAccountModel } from "../../../domain/models/add-account-model.interface";
import { IAddAccount } from "../../../domain/usecases/add-account.interface";
import { IAddAccountRepository } from "../../protocols/add-account-repository.interface";
import { IEncrypter } from "../../protocols/encrypter.interface";


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