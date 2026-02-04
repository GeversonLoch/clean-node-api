import { IAccountModel } from '@domain/models'
import { IAddAccount, IAuthentication } from '@domain/usecases'

export const mockAccountModel = (): IAccountModel => ({
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@email.com',
    password: 'any_password',
})

export const mockAddAccountParams = (): IAddAccount.Params => ({
    name: 'any_name',
    email: 'any_email@email.com',
    password: 'any_password',
})

export const mockAddAccountExtraParams = (extra: object) => {
    return {
        ...mockAddAccountParams(),
        ...extra
    }
}

export const mockAuthenticationParams = (): IAuthentication.Params => ({
    email: 'any_email@email.com',
    password: 'any_password',
})

export const mockAuthenticationModel = (): IAuthentication.Result => ({
    accessToken: 'any_token',
    name: 'any_name',
})
