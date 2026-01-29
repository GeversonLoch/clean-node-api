import { IAccountModel } from '@domain/models'

export type IAddAccountParams = Omit<IAccountModel, 'id'>

export interface IAddAccount {
    add (account: IAddAccountParams): Promise<IAccountModel>
}