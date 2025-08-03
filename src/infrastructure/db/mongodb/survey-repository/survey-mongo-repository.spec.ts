import { IAddSurveyModel } from '@domain/models'
import { SurveyMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { Collection } from 'mongodb'
import MockDate from 'mockdate'

let surveyCollection: Collection

beforeAll(async () => {
    await mongoDBAdapter.connect()
    MockDate.set(new Date())
})

beforeEach(async () => {
    surveyCollection = await mongoDBAdapter.getCollection('surveys')
    await surveyCollection.deleteMany({})
})

afterAll(async () => {
    await mongoDBAdapter.disconnect()
    MockDate.reset()
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
    date: new Date(),
})

describe('Survey Mongo Repository', () => {
    describe('add()', () => {
        // Garante que o Survey MongoRepository adicione uma nova pesquisa ao executar o método 'add' com sucesso
        test('Should add a survey on success', async () => {
            const sut = new SurveyMongoRepository(mongoDBAdapter)
            await sut.add(makeFakeSurveyData())
            const survey = await surveyCollection.findOne({ question: 'any_question' })
            expect(survey).toBeTruthy()
            expect(survey._id).toBeTruthy()
        })
    })
})
