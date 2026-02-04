import { IAddAccount, ILoadAccountByToken } from '@domain/usecases'
import { IAccountModel } from '@domain/models'
import { mockAccountModel } from '@domain/test'

export const mockAddAccount = (): IAddAccount => {
    class AddAccountStub implements IAddAccount {
        async add(account: IAddAccount.Params): Promise<IAddAccount.Result> {
            return true
        }
    }
    return new AddAccountStub()
}

export const mockLoadAccountByToken = (): ILoadAccountByToken => {
    class LoadAccountByToken implements ILoadAccountByToken {
        async loadByToken(accessToken: string, role?: string): Promise<IAccountModel> {
            return Promise.resolve(mockAccountModel())
        }
    }
    return new LoadAccountByToken()
}
