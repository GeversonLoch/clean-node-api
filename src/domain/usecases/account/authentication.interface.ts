import { IAuthenticationParams } from '@domain/models';

export interface IAuthentication {
    auth(authentication: IAuthenticationParams): Promise<string>
}