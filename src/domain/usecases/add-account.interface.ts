import { IAccountModel } from "../models/account-model.interface"
import { IAddAccountModel } from "../models/add-account-model.interface"

export interface IAddAccount {
    add (account: IAddAccountModel): Promise<IAccountModel>
}