import { IAddAccountRepository } from "@data/protocols"
import { IAccountModel, IAddAccountModel } from "@domain/models"
import { IMongoHelper } from "@infrastructure/db"

export class AccountMongoRepository implements IAddAccountRepository {

    constructor(private readonly mongoHelper: IMongoHelper) {}

    async add(account: IAddAccountModel): Promise<IAccountModel> {
        const accountCollection = this.mongoHelper.getCollection('accounts')
        const result = await accountCollection.insertOne(account)
        const newAccount = await accountCollection.findOne({ _id: result.insertedId })
        return this.mongoHelper.map(newAccount)
    }
}
