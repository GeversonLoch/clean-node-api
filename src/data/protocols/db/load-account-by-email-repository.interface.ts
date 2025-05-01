import { IAccountModel } from '@domain/models'

export interface ILoadAccountByEmailRepository {
    loadByEmail(email: string): Promise<IAccountModel>
}
