import { IAccountModel } from '@domain/models'

export interface ILoadAccountByEmailRepository {
    load: (email: string) => Promise<IAccountModel>
}
