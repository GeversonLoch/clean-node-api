import { IAccountModel } from '@domain/models'

export interface ILoadAccountByToken {
    loadByToken(accessToken: string, role?: string): Promise<IAccountModel>
}
