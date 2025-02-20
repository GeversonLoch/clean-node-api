import { IAddAccountRepository } from '../../../../data/protocols/add-account-repository'
import { IAccountModel } from "../../../../domain/models/account"
import { IAddAccountModel } from "../../../../domain/usecases/add-account"
import { IMongoHelper } from '../protocols/mongo-helper'

export class AccountMongoRepository implements IAddAccountRepository {

    constructor(private readonly mongoHelper: IMongoHelper) {}

    async add(account: IAddAccountModel): Promise<IAccountModel> {
        const accountCollection = this.mongoHelper.getCollection('accounts')
        const result = await accountCollection.insertOne(account)
        const newAccount = await accountCollection.findOne({ _id: result.insertedId })
        return this.mongoHelper.map(newAccount)
    }
}
