/*
 * Testes de integração para o repositório de contas utilizando o MongoDB.
 * O ambiente de teste é configurado com a conexão ao banco de dados e a limpeza da coleção 'accounts'
 * é realizada antes de cada teste, garantindo um ambiente isolado e consistente. As operações de inserção
 * de contas são validadas para assegurar a correta persistência dos dados.
 */

import { AccountMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
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
        /* Garante que, ao adicionar uma conta, o método 'add' do repositório retorna um objeto válido,
        com um ID gerado e os dados (nome, email, senha) corretamente persistidos. */
        test('Should return an account on add success', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            const account = await sut.add({
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'any_password',
            })
            expect(account).toBeTruthy()
            expect(account.id).toBeTruthy()
            expect(account.name).toBe('any_name')
            expect(account.email).toBe('any_email@email.com')
            expect(account.password).toBe('any_password')
        })
    })

    describe('loadByEmail()', () => {
        // Garante que retorne uma conta se o método loadByEmail for bem sucedido
        test('Should return an account on loadByEmail success', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            await accountCollection.insertOne({
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'any_password',
            })
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
            ).insertOne({
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'any_password',
            })
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
        // Garante que retorne uma conta se o método loadByToken for bem sucedido sem regra
        test('Should return an account on loadByToken success without role', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            await accountCollection.insertOne({
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'any_password',
                accessToken: 'any_token',
            })
            const account = await sut.loadByToken('any_token')
            expect(account).toBeTruthy()
            expect(account.id).toBeTruthy()
            expect(account.name).toBe('any_name')
            expect(account.email).toBe('any_email@email.com')
            expect(account.password).toBe('any_password')
        })

        // Garante que retorne uma conta se o método loadByToken for bem sucedido com regra
        test('Should return an account on loadByToken success with role', async () => {
            const sut = new AccountMongoRepository(mongoDBAdapter)
            await accountCollection.insertOne({
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'any_password',
                accessToken: 'any_token',
                role: 'any_role',
            })
            const account = await sut.loadByToken('any_token', 'any_role')
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
