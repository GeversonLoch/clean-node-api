/*
* Implementação do repositório de Accounts utilizando o MongoDB.
* A classe AccountMongoRepository adere à interface IAddAccountRepository e é responsável
* por persistir os dados de uma conta no banco, utilizando um helper/adapter para lidar com operações do MongoDB.
*/

import { IAddAccountRepository } from "@data/protocols"
import { IAccountModel, IAddAccountModel } from "@domain/models"
import { IMongoHelper } from "@infrastructure/db"

export class AccountMongoRepository implements IAddAccountRepository {

    constructor(private readonly mongoHelper: IMongoHelper) {}

    /* Adiciona uma nova conta na coleção 'accounts' do MongoDB.
    Este método recebe os dados da conta (IAddAccountModel), insere no banco,
    recupera o documento recém-criado e o converte para o formato IAccountModel,
    incluindo a conversão do _id do MongoDB para o campo id. */
    async add(account: IAddAccountModel): Promise<IAccountModel> {
        const accountCollection = this.mongoHelper.getCollection('accounts')
        const result = await accountCollection.insertOne(account)
        const newAccount = await accountCollection.findOne({ _id: result.insertedId })
        return this.mongoHelper.map(newAccount)
    }
}
