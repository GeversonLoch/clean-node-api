import { IAddAccountModel, IAddAccountService } from '../../../domain/usecases/add-account'
import { IAccountModel } from '../../../domain/models/account'
import { IEncrypter } from '../../protocols/encrypter'

export class DbAddAccount implements IAddAccountService {

    private readonly encrypter: IEncrypter;

    constructor (encrypter: IEncrypter) {
        this.encrypter = encrypter
    }

    async add(account: IAddAccountModel): Promise<IAccountModel> {
        await this.encrypter.encrypt(account.password)
        return Promise.resolve(null)
    }

}