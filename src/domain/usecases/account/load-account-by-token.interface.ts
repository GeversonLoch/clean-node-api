import { IAccountModel } from '@domain/models'

export interface ILoadAccountByToken {
    loadByToken(accessToken: string, role?: string): Promise<ILoadAccountByToken.Result>
}

export namespace ILoadAccountByToken {
    export type Result = IAccountModel
}
