import { AccountMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { mockAddAccountExtraParams, mockAddAccountParams } from '@domain/test'
import { Collection } from 'mongodb'

let accountCollection: Collection

beforeAll(async () => {
    await mongoDBAdapter.connect()
})

beforeEach(async () => {
    accountCollection = await mongoDBAdapter.getCollection('accounts')
    await accountCollection.deleteMany({})
})

afterAll(async () => {
    await mongoDBAdapter.disconnect()
})

describe('Account Mongo Repository', () => {
    describe('add()', () => {
        // Garante que, ao adicionar uma conta, o método 'add' do repositório retorne true
        test('Should return true on add success', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            const isValidAccount = await sut.add(mockAddAccountParams())
            expect(isValidAccount).toBe(true)
        })
    })

    describe('loadByEmail()', () => {
        // Garante que retorne uma conta se o método loadByEmail for bem sucedido
        test('Should return an account on loadByEmail success', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            await accountCollection.insertOne(mockAddAccountParams())
            const account = await sut.loadByEmail('any_email@email.com')
            expect(account).toBeTruthy()
            expect(account.id).toBeTruthy()
            expect(account.name).toBe('any_name')
            expect(account.email).toBe('any_email@email.com')
            expect(account.password).toBe('any_password')
        })

        // Garante que retorne nulo se loadByEmail falhar na obtenção do registro
        test('Should return null if loadByEmail fails', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            const account = await sut.loadByEmail('any_email@email.com')
            expect(account).toBeFalsy()
        })
    })

    describe('updateAccessToken()', () => {
        // Garante que o token de acesso seja atualizado se o método updateAccessToken for bem sucedido
        test('Should update the account accessToken on updateAccessToken success', async () => {
            const account = await (
                await mongoDBAdapter.getCollection('accounts')
            ).insertOne(mockAddAccountParams())
            const insertedAccount = await (
                await mongoDBAdapter.getCollection('accounts')
            ).findOne({ _id: account.insertedId })
            expect(insertedAccount?.accessToken).toBeFalsy()
            const sut = new AccountMongoRepository(mongoDBAdapter)
            await sut.updateAccessToken(account.insertedId.toHexString(), 'new_token')
            const updatedAccount = await (
                await mongoDBAdapter.getCollection('accounts')
            ).findOne({ _id: account.insertedId })
            expect(updatedAccount).toBeTruthy()
            expect(updatedAccount.accessToken).toBe('new_token')
        })
    })

    describe('loadByToken()', () => {
        // Garante que retorne uma conta se o método loadByToken for bem sucedido sem role informado
        test('Should return an account on loadByToken without role', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            await accountCollection.insertOne(mockAddAccountExtraParams({ accessToken: 'any_token' }))
            const account = await sut.loadByToken('any_token')
            expect(account).toBeTruthy()
            expect(account.id).toBeTruthy()
            expect(account.name).toBe('any_name')
            expect(account.email).toBe('any_email@email.com')
            expect(account.password).toBe('any_password')
        })

        // Garante que retorne uma conta se o método loadByToken for bem sucedido com role admin
        test('Should return an account on loadByToken with admin role', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            await accountCollection.insertOne(mockAddAccountExtraParams({
                accessToken: 'any_token',
                role: 'admin',
            }))
            const account = await sut.loadByToken('any_token', 'admin')
            expect(account).toBeTruthy()
            expect(account.id).toBeTruthy()
            expect(account.name).toBe('any_name')
            expect(account.email).toBe('any_email@email.com')
            expect(account.password).toBe('any_password')
        })

        // Garante que o loadByToken retorne null se o token é válido, mas o usuário não possui a role exigida
        test('Should return null on loadByToken with invalid role', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            await accountCollection.insertOne(mockAddAccountExtraParams({
                accessToken: 'any_token',
            }))
            const account = await sut.loadByToken('any_token', 'admin')
            expect(account).toBeFalsy()
        })

        // Garante que retorne uma conta se o método loadByToken for chamado com token válido
        test('Should return an account on loadByToken with if user is admin', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            await accountCollection.insertOne(mockAddAccountExtraParams({
                accessToken: 'any_token',
                role: 'admin',
            }))
            const account = await sut.loadByToken('any_token')
            expect(account).toBeTruthy()
            expect(account.id).toBeTruthy()
            expect(account.name).toBe('any_name')
            expect(account.email).toBe('any_email@email.com')
            expect(account.password).toBe('any_password')
        })

        // Garante que retorne nulo se loadByToken falhar na obtenção do registro
        test('Should return null if loadByToken fails', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            const account = await sut.loadByToken('any_token')
            expect(account).toBeFalsy()
        })
    })
})
