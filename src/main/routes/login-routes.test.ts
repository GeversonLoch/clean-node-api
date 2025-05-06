/**
* Arquivo de testes das rotas de cadastro (signup).
* Utiliza o supertest para simular requisições HTTP e validar as respostas da API.
*/
import request from 'supertest'
import app from '@main/config/app'
import { mongoDBAdapter } from '@main/config/db-connection'
import { Collection } from 'mongodb'
import { hash } from 'bcrypt'

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

describe('POST /signup', () => {
    // Garante que a rota POST '/signup' retorna status 200 em caso de sucesso
    test('Should return 200 on signup', async () => {
        await request(app)
            .post('/api/signup')
            .send({
                name: 'Nome',
                email: 'nome.sobrenome@email.com',
                password: '123abc',
                passwordConfirmation: '123abc',
            })
            .expect(200)
    })
})

describe('POST /login', () => {
    // Garante que a rota POST '/login' retorna status 200 em caso de sucesso
    test('Should return 200 on login', async () => {
        const password = await hash('123abc', 12)
        await accountCollection.insertOne({
            name: 'Nome',
            email: 'nome.sobrenome@email.com',
            password,
        })
        await request(app)
            .post('/api/login')
            .send({
                email: 'nome.sobrenome@email.com',
                password: '123abc',
            })
            .expect(200)
    })

    // Garante que a rota POST '/login' retorna status 401 caso o usuario não exista
    test('Should return 401 on login', async () => {
        await request(app)
            .post('/api/login')
            .send({
                email: 'nome.sobrenome@email.com',
                password: '123abc',
            })
            .expect(401)
    })
})
