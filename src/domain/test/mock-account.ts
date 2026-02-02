import { IAccountModel, IAuthenticationModel, IAuthenticationParams } from '@domain/models'
import { IAddAccountParams } from '@domain/usecases'

export const mockAccountModel = (): IAccountModel => ({
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@email.com',
    password: 'any_password',
})

export const mockAddAccountParams = (): IAddAccountParams => ({
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

export const mockAuthenticationParams = (): IAuthenticationParams => ({
    email: 'any_email@email.com',
    password: 'any_password',
})

export const mockAuthenticationModel = (): IAuthenticationModel => ({
    accessToken: 'any_token',
    name: 'any_name',
})
