import { IAuthenticationModel } from "@domain/models";

export interface IAuthentication {
    auth(authentication: IAuthenticationModel): Promise<string>
}