import { IAddAccountRepository } from '../../../../data/protocols/add-account-repository.interface'
import { IAccountModel } from "../../../../domain/models/account-model.interface"
import { IAddAccountModel } from '../../../../domain/models/add-account-model.interface'
import { IMongoHelper } from '../helpers/mongo-helper.interface'

export class AccountMongoRepository implements IAddAccountRepository {

    constructor(private readonly mongoHelper: IMongoHelper) {}

    async add(account: IAddAccountModel): Promise<IAccountModel> {
        const accountCollection = this.mongoHelper.getCollection('accounts')
        const result = await accountCollection.insertOne(account)
        const newAccount = await accountCollection.findOne({ _id: result.insertedId })
        return this.mongoHelper.map(newAccount)
    }
}
