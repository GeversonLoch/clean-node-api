/*
* Repositório MongoDB para gerenciamento de contas.
*
* Esta implementação de AccountMongoRepository adere às interfaces
* IAddAccountRepository e ILoadAccountByEmailRepository e é responsável
* por adicionar novas contas e obter contas na coleção 'accounts' do MongoDB.
* Utiliza IMongoDBAdapter para realizar operações
* de conexão, obtenção de coleção e mapeamento de documentos.
*/

import { IAddAccountRepository, ILoadAccountByEmailRepository, ILoadAccountByTokenRepository, IUpdateAccessTokenRepository } from '@data/protocols'
import { IAccountModel, IAddAccountModel } from '@domain/models'
import { IMongoDBAdapter } from '@infrastructure/db'
import { ObjectId } from 'mongodb'

export class AccountMongoRepository implements
    IAddAccountRepository,
    ILoadAccountByEmailRepository,
    IUpdateAccessTokenRepository,
    ILoadAccountByTokenRepository {
    constructor(private readonly mongoDBAdapter: IMongoDBAdapter) { }

    /* Adiciona uma nova conta na coleção 'accounts' do MongoDB.
    Este método recebe os dados da conta (IAddAccountModel), insere no banco,
    recupera o documento recém-criado e o converte para o formato IAccountModel,
    incluindo a conversão do _id do MongoDB para o campo id. */
    async add(account: IAddAccountModel): Promise<IAccountModel> {
        const accountCollection = await this.mongoDBAdapter.getCollection('accounts')
        const result = await accountCollection.insertOne(account)
        const newAccount = await accountCollection.findOne({ _id: result.insertedId })
        return this.mongoDBAdapter.map(newAccount)
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

    async loadByToken(accessToken: string, role?: string): Promise<IAccountModel> {
        const accountCollection = await this.mongoDBAdapter.getCollection('accounts')
        const account = await accountCollection.findOne({
            accessToken,
            role,
        })
        return this.mongoDBAdapter.map(account)
    }
}
