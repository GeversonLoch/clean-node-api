import { IAccountModel } from '@domain/models'

export interface ILoadAccountByTokenRepository {
    loadByToken(accessToken: string, role?: string): Promise<ILoadAccountByTokenRepository.Result>
}

export namespace ILoadAccountByTokenRepository {
    export type Result = IAccountModel
}
