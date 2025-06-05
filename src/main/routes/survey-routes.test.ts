import request from 'supertest'
import app from '@main/config/app'
import { mongoDBAdapter } from '@main/config/db-connection'
import { Collection } from 'mongodb'
import { IAddSurveyModel } from '@domain/models'

let surveyCollection: Collection

beforeAll(async () => {
    await mongoDBAdapter.connect()
})

beforeEach(async () => {
    surveyCollection = await mongoDBAdapter.getCollection('surveys')
    await surveyCollection.deleteMany({})
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
    // Garante que a rota POST '/add-survey' retorna status 204 em caso de sucesso
    test('Should return 204 on add survey success', async () => {
        await request(app)
            .post('/api/add-survey')
            .send(makeFakeSurveyData())
            .expect(204)
    })
})
