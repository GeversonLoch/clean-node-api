import { IAccountModel, IAddAccountModel } from "@domain/models"

export interface IAddAccount {
    add (account: IAddAccountModel): Promise<IAccountModel>
}