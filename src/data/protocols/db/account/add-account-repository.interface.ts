import { IAccountModel, IAddAccountModel } from "@domain/models"

export interface IAddAccountRepository {
    add(account: IAddAccountModel): Promise<IAccountModel>
}