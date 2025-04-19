import { IAuthenticatorModel } from "@domain/models";

export interface IAuthenticator {
    auth(authenticator: IAuthenticatorModel): Promise<string>
}