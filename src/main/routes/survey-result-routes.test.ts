import request from 'supertest'
import app from '@main/config/app'
import { mongoDBAdapter } from '@main/config/db-connection'
import { Collection } from 'mongodb'
import { mockAddAccountParams, mockAddSurveyParamsCollection } from '@domain/test'
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

const makeFakeSurveyPayload = () => ({
    question: 'any_question',
    answer: 'any_answer',
})

const makeAccessToken = async (): Promise<string> => {
    const { insertedId } = await accountCollection.insertOne(mockAddAccountParams())
    const accessToken = sign({ id: insertedId }, jwtSecretIntegrationTest)
    await accountCollection.updateOne({ _id: insertedId }, {
        $set: {
            accessToken
        }
    })
    return accessToken
}

describe('PUT /surveys/:surveyId/results', () => {
    // Garante que a rota PUT '/surveys/:surveyId/results' retorne status 403 caso não seja passado um accessToken valido
    test('Should return 403 on save survey result without accessToken', async () => {
        await request(app)
            .put('/api/surveys/any_id/results')
            .send(makeFakeSurveyPayload())
            .expect(403)
    })

    // Garante que a rota PUT '/surveys/:surveyId/results' retorne status 200 caso seja passado um accessToken valido
    test('Should return 200 on save survey result with valid accessToken', async () => {
        const res = await surveyCollection.insertMany(mockAddSurveyParamsCollection())
        const id = res.insertedIds[0]
        const accessToken = await makeAccessToken()
        await request(app)
            .put(`/api/surveys/${id.toString()}/results`)
            .set('x-access-token', accessToken)
            .send(makeFakeSurveyPayload())
            .expect(200)
    })
})

describe('GET /surveys/:surveyId/results', () => {
    // Garante que a rota GET '/surveys/:surveyId/results' retorne status 403 caso não seja passado um accessToken valido
    test('Should return 403 on load survey result without accessToken', async () => {
        await request(app)
            .get('/api/surveys/any_id/results')
            .expect(403)
    })

    // Garante que a rota GET '/surveys/:surveyId/results' retorne status 200 caso seja passado um accessToken valido
    test('Should return 200 on load survey result with valid accessToken', async () => {
        const res = await surveyCollection.insertMany(mockAddSurveyParamsCollection())
        const id = res.insertedIds[0]
        const accessToken = await makeAccessToken()
        await request(app)
            .get(`/api/surveys/${id.toString()}/results`)
            .set('x-access-token', accessToken)
            .expect(200)
    })
})
