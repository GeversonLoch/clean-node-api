import request from 'supertest'
import app from '@main/config/app'
import { mongoDBAdapter } from '@main/config/db-connection'
import {
    mockAddAccountParams,
    mockAddAccountExtraParams,
    mockAddSurveyParams,
    mockAddSurveyParamsCollection,
} from '@domain/test'
import { Collection } from 'mongodb'
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

describe('POST /add-survey', () => {
    // Garante que a rota POST '/add-survey' retorne status 403 caso não seja passado um accessToken de usuário admin
    test('Should return 403 on add survey without accessToken', async () => {
        await request(app)
            .post('/api/add-survey')
            .send(mockAddSurveyParams())
            .expect(403)
    })

    // Garante que a rota POST '/add-survey' retorne status 204 caso seja passado um accessToken de usuário admin valido
    test('Should return 204 on add survey with valid accessToken', async () => {
        const { insertedId } = await accountCollection.insertOne(mockAddAccountExtraParams({ role: 'admin' }))
        const accessToken = sign({ id: insertedId }, jwtSecretIntegrationTest)
        await accountCollection.updateOne({ _id: insertedId }, {
            $set: {
                accessToken
            }
        })
        await request(app)
            .post('/api/add-survey')
            .set('x-access-token', accessToken)
            .send(mockAddSurveyParams())
            .expect(204)
    })

    // Garante que a rota POST '/add-survey' retorne status 403 caso seja passado um accessToken admin invalido
    test('Should return 403 on add survey with invalid accessToken', async () => {
        const { insertedId } = await accountCollection.insertOne(mockAddAccountExtraParams({ role: 'admin' }))
        const accessToken = sign({ id: insertedId }, jwtSecretIntegrationTest)
        await accountCollection.updateOne({ _id: insertedId }, {
            $set: {
                accessToken
            }
        })
        await request(app)
            .post('/api/add-survey')
            .set('x-access-token', 'invalid_token')
            .send(mockAddSurveyParams())
            .expect(403)
    })
})

describe('GET /surveys', () => {
    // Garante que a rota GET '/surveys' retorne status 403 caso não seja passado um accessToken
    test('Should return 403 on load surveys without accessToken', async () => {
        await request(app)
            .get('/api/surveys')
            .expect(403)
    })

    // Garante que a rota GET '/surveys' retorne status 204 caso seja passado um accessToken valido
    test('Should return 204 on add survey with valid accessToken', async () => {
        const accessToken = await makeAccessToken()
        await request(app)
            .get('/api/surveys')
            .set('x-access-token', accessToken)
            .expect(204)
    })

    // Garante que a rota GET '/surveys' retorne status 200 caso seja passado um accessToken valido
    test('Should return 200 on add survey with valid accessToken', async () => {
        await surveyCollection.insertMany(mockAddSurveyParamsCollection())
        const accessToken = await makeAccessToken()
        await request(app)
            .get('/api/surveys')
            .set('x-access-token', accessToken)
            .expect(200)
    })
})
