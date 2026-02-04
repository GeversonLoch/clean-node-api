import { IAddAccount } from '@domain/usecases'

export interface IAddAccountRepository {
    add(account: IAddAccountRepository.Params): Promise<IAddAccountRepository.Result>
}

export namespace IAddAccountRepository {
    export type Params = IAddAccount.Params
    export type Result = IAddAccount.Result
}
