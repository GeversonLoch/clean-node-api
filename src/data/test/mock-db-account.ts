import {
    IAddAccountRepository,
    ICheckAccountByEmailRepository,
    ILoadAccountByEmailRepository,
    ILoadAccountByTokenRepository,
    IUpdateAccessTokenRepository,
} from '@data/protocols'
import { mockAccountModel } from '@domain/test'

export const mockAddAccountRepository = (): IAddAccountRepository => {
    class AddAccountRepositoryStub implements IAddAccountRepository {
        async add(account: IAddAccountRepository.Params): Promise<IAddAccountRepository.Result> {
            return Promise.resolve(true)
        }
    }
    return new AddAccountRepositoryStub()
}

export const mockCheckAccountByEmailRepository = () => {
    class CheckAccountByEmailRepositoryStub implements ICheckAccountByEmailRepository {
        async checkByEmail(email: string): Promise<boolean> {
            return Promise.resolve(false)
        }
    }
    return new CheckAccountByEmailRepositoryStub()
}

export const mockLoadAccountByEmailRepository = () => {
    class LoadAccountByEmailRepositoryStub implements ILoadAccountByEmailRepository {
        async loadByEmail(email: string): Promise<ILoadAccountByEmailRepository.Result> {
            return Promise.resolve(mockAccountModel())
        }
    }
    return new LoadAccountByEmailRepositoryStub()
}

export const mockLoadAccountByTokenRepository = (): ILoadAccountByTokenRepository => {
    class LoadAccountByTokenRepository implements ILoadAccountByTokenRepository {
        async loadByToken(accessToken: string, role?: string): Promise<ILoadAccountByTokenRepository.Result> {
            return Promise.resolve(mockAccountModel())
        }
    }
    return new LoadAccountByTokenRepository()
}

export const mockUpdateAccessTokenRepository = (): IUpdateAccessTokenRepository => {
    class UpdateAccessTokenRepositoryStub implements IUpdateAccessTokenRepository {
        async updateAccessToken(id: string, token: string): Promise<void> {
            return Promise.resolve()
        }
    }
    return new UpdateAccessTokenRepositoryStub()
}
