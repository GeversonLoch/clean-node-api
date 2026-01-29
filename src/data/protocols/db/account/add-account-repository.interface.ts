import { IAccountModel } from '@domain/models'
import { IAddAccountParams } from '@domain/usecases'

export interface IAddAccountRepository {
    add(account: IAddAccountParams): Promise<IAccountModel>
}