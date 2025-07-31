import request from 'supertest'
import app from '@main/config/app'
import { mongoDBAdapter } from '@main/config/db-connection'
import { Collection } from 'mongodb'
import { IAddSurveyModel } from '@domain/models'
import { sign } from 'jsonwebtoken'

let surveyCollection: Collection
let accountCollection: Collection

// TODO: Mover os secrets dos testes para um objeto global!
const jwtSecretIntegrationTest = 'S1w/bYomPDSl4uEkE9YxvURoetjSrC1dIvp9PZA3/dPkJJEH8y30bzqAVh3VN2c/ta2KE4kugRjasXppDqlbnQ=='

beforeAll(async () => {
    await mongoDBAdapter.connect()
})

beforeEach(async () => {
    surveyCollection = await mongoDBAdapter.getCollection('surveys')
    await surveyCollection.deleteMany({})
    accountCollection = await mongoDBAdapter.getCollection('accounts')
    await accountCollection.deleteMany({})
})

afterAll(async () => {
    await mongoDBAdapter.disconnect()
})

const makeFakeSurveyData = (): IAddSurveyModel => ({
    question: 'any_question',
    answers: [
        {
            answer: 'any_answer',
            image: 'any_image',
        },
        {
            answer: 'any_answer',
        },
    ],
})

describe('POST /add-survey', () => {
    // Garante que a rota POST '/add-survey' retorne status 403 caso não seja passado um accessToken de usuário admin
    test('Should return 403 on add survey without accessToken', async () => {
        await request(app)
            .post('/api/add-survey')
            .send(makeFakeSurveyData())
            .expect(403)
    })

    // Garante que a rota POST '/add-survey' retorne status 204 caso seja passado um accessToken de usuário admin valido
    test('Should return 403 on add survey with valid accessToken', async () => {
        const { insertedId } = await accountCollection.insertOne({
            name: 'Nome',
            email: 'nome.sobrenome@email.com',
            password: '123abc',
            role: 'admin'
        })
        const accessToken = sign({ id: insertedId }, jwtSecretIntegrationTest)
        await accountCollection.updateOne({ _id: insertedId }, {
            $set: {
                accessToken
            }
        })
        await request(app)
            .post('/api/add-survey')
            .set('x-access-token', accessToken)
            .send(makeFakeSurveyData())
            .expect(204)
    })

    // Garante que a rota POST '/add-survey' retorne status 403 caso seja passado um accessToken admin invalido
    test('Should return 403 on add survey with invalid accessToken', async () => {
        const { insertedId } = await accountCollection.insertOne({
            name: 'Nome',
            email: 'nome.sobrenome@email.com',
            password: '123abc',
            role: 'admin'
        })
        const accessToken = sign({ id: insertedId }, jwtSecretIntegrationTest)
        await accountCollection.updateOne({ _id: insertedId }, {
            $set: {
                accessToken
            }
        })
        await request(app)
            .post('/api/add-survey')
            .set('x-access-token', 'invalid_token')
            .send(makeFakeSurveyData())
            .expect(403)
    })
})
