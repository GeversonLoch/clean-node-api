/**
* Arquivo de testes das rotas de cadastro (signup).
* Utiliza o supertest para simular requisições HTTP e validar as respostas da API.
*/
import request from "supertest"
import app from "@main/config/app"
import { MongoHelper } from "@infrastructure/db"

let mongoHelper: MongoHelper

beforeAll(async () => {
  mongoHelper = new MongoHelper(process.env.MONGO_URL, 'jest')
  await mongoHelper.connect()
})

beforeEach(async () => {
  const accountCollection = mongoHelper.getCollection('accounts')
  await accountCollection.deleteMany({})
})

afterAll(async () => {
  await mongoHelper.disconnect()
})

describe('Signup Routes', () => {
    // Garante que a rota POST '/api/signup' retorna status 200 em caso de sucesso
    test('Should return an account on success', async () => {
        await request(app)
            .post('/api/signup')
            .send({
                name: 'Nome',
                email: 'nome.sobrenome@email.com',
                password: '123abc',
                passwordConfirmation: '123abc'
            })
            .expect(200)
    })
})
