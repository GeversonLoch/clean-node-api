import {
    IAddAccountRepository,
    ILoadAccountByEmailRepository,
    ILoadAccountByTokenRepository,
    IUpdateAccessTokenRepository,
} from '@data/protocols'
import { IAccountModel } from '@domain/models'
import { IAddAccountParams } from '@domain/usecases'
import { mockAccountModel } from '@domain/test'

export const mockAddAccountRepository = (): IAddAccountRepository => {
    class AddAccountRepositoryStub implements IAddAccountRepository {
        async add(account: IAddAccountParams): Promise<IAccountModel> {
            return new Promise(resolve => resolve(mockAccountModel()))
        }
    }
    return new AddAccountRepositoryStub()
}

export const mockLoadAccountByEmailRepository = () => {
    class LoadAccountByEmailRepositoryStub implements ILoadAccountByEmailRepository {
        async loadByEmail(email: string): Promise<IAccountModel> {
            return new Promise(resolve => resolve(mockAccountModel()))
        }
    }
    return new LoadAccountByEmailRepositoryStub()
}

export const mockLoadAccountByTokenRepository = (): ILoadAccountByTokenRepository => {
    class LoadAccountByTokenRepository implements ILoadAccountByTokenRepository {
        async loadByToken(accessToken: string, role?: string): Promise<IAccountModel> {
            return Promise.resolve(mockAccountModel())
        }
    }
    return new LoadAccountByTokenRepository()
}

export const mockUpdateAccessTokenRepository = (): IUpdateAccessTokenRepository => {
    class UpdateAccessTokenRepositoryStub implements IUpdateAccessTokenRepository {
        async updateAccessToken(id: string, token: string): Promise<void> {
            return new Promise(resolve => resolve())
        }
    }
    return new UpdateAccessTokenRepositoryStub()
}
