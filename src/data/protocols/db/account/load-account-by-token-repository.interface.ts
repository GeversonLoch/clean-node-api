import { IAccountModel } from '@domain/models'

export interface ILoadAccountByTokenRepository {
    loadByToken(accessToken: string, role?: string): Promise<IAccountModel>
}
