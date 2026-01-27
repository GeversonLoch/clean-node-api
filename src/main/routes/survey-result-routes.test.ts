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

const makeFakeAccount = (extra?: object): any => {
    const account = {
        name: 'Nome',
        email: 'nome.sobrenome@email.com',
        password: '123abc',
    }
    return extra ? { ...account, ...extra } : account
}

const makeFakeSurveyPayload = () => ({
    question: 'any_question',
    answer: 'any_answer',
})

const makeFakeSurveyCollection = (): IAddSurveyModel[] => [
    {
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
        date: new Date(),
    },
    {
        question: 'other_question',
        answers: [
            {
                answer: 'other_answer',
                image: 'other_image',
            },
            {
                answer: 'other_answer',
            },
        ],
        date: new Date(),
    },
]

const makeAccessToken = async (): Promise<string> => {
    const { insertedId } = await accountCollection.insertOne(makeFakeAccount())
    const accessToken = sign({ id: insertedId }, jwtSecretIntegrationTest)
    await accountCollection.updateOne({ _id: insertedId }, {
        $set: {
            accessToken
        }
    })
    return accessToken
}

describe('PUT /surveys/:surveyId/results', () => {
    // Garante que a rota PUT '/surveys/:surveyId/results' retorne status 403 caso não seja passado um accessToken de usuário admin
    test('Should return 403 on save survey result without accessToken', async () => {
        await request(app)
            .put('/api/surveys/any_id/results')
            .send(makeFakeSurveyPayload())
            .expect(403)
    })

    // Garante que a rota PUT '/surveys/:surveyId/results' retorne status 200 caso seja passado um accessToken valido
    test('Should return 200 on save survey result with valid accessToken', async () => {
        const res = await surveyCollection.insertMany(makeFakeSurveyCollection())
        const id = res.insertedIds[0]
        const accessToken = await makeAccessToken()
        await request(app)
            .put(`/api/surveys/${id.toString()}/results`)
            .set('x-access-token', accessToken)
            .send(makeFakeSurveyPayload())
            .expect(200)
    })
})
