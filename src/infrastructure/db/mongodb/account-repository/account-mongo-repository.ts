import { IAddAccountRepository, ILoadAccountByEmailRepository, ILoadAccountByTokenRepository, IUpdateAccessTokenRepository } from '@data/protocols'
import { IAccountModel } from '@domain/models'
import { IMongoDBAdapter } from '@infrastructure/db'
import { ObjectId } from 'mongodb'

export class AccountMongoRepository implements
    IAddAccountRepository,
    ILoadAccountByEmailRepository,
    IUpdateAccessTokenRepository,
    ILoadAccountByTokenRepository {
    constructor(private readonly mongoDBAdapter: IMongoDBAdapter) { }

    async add(account: IAddAccountRepository.Params): Promise<IAddAccountRepository.Result> {
        const accountCollection = await this.mongoDBAdapter.getCollection('accounts')
        const result = await accountCollection.insertOne(account)
        return result.insertedId !== null
    }

    async loadByEmail(email: string): Promise<IAccountModel> {
        const accountCollection = await this.mongoDBAdapter.getCollection('accounts')
        const account = await accountCollection.findOne({ email })
        return this.mongoDBAdapter.map(account)
    }

    async updateAccessToken(id: string, token: string): Promise<void> {
        const accountCollection = await this.mongoDBAdapter.getCollection('accounts')
        await accountCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { accessToken: token } }
        )
    }

    async loadByToken(accessToken: string, role?: string): Promise<ILoadAccountByTokenRepository.Result> {
        const accountCollection = await this.mongoDBAdapter.getCollection('accounts')
        const account = await accountCollection.findOne({
            accessToken,
            $or: [
                {
                    role,
                },
                {
                    role: 'admin',
                },
            ],
        })
        return this.mongoDBAdapter.map(account)
    }
}
