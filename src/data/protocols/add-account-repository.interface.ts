import { IAddAccountModel } from "../../domain/models/add-account-model.interface"
import { IAccountModel } from "../../domain/models/account-model.interface"

export interface IAddAccountRepository {
    add(account: IAddAccountModel): Promise<IAccountModel>
}