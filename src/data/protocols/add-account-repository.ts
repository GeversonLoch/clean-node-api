import { IAddAccountModel } from '../../domain/usecases/add-account'
import { IAccountModel } from "../../domain/models/account"

export interface IAddAccountRepository {
    add(account: IAddAccountModel): Promise<IAccountModel>
}