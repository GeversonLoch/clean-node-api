import { IAccountModel } from '@domain/models'

export interface IAddAccount {
    add(account: IAddAccount.Params): Promise<IAddAccount.Result>
}

export namespace IAddAccount {
    export type Params = Omit<IAccountModel, 'id'>
    export type Result = boolean
}
