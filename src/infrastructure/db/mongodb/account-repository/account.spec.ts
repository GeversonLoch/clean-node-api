/*
* Testes de integração para o repositório de contas utilizando o MongoDB.
* O ambiente de teste é configurado com a conexão ao banco de dados e a limpeza da coleção 'accounts'
* é realizada antes de cada teste, garantindo um ambiente isolado e consistente. As operações de inserção
* de contas são validadas para assegurar a correta persistência dos dados.
*/

import { AccountMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'

beforeAll(async () => {
    await mongoDBAdapter.connect()
})

beforeEach(async () => {
    const accountCollection = await mongoDBAdapter.getCollection('accounts')
    await accountCollection.deleteMany({})
})

afterAll(async () => {
    await mongoDBAdapter.disconnect()
})

describe('Account Mongo Repository', () => {
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
