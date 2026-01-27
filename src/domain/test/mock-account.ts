import { IAccountModel } from '@domain/models'
import { IAddAccountParams } from '@domain/usecases'

export const mockAccountModel = (): IAccountModel => ({
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password',
})

export const mockAddAccountParams = (): IAddAccountParams => ({
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password',
})
