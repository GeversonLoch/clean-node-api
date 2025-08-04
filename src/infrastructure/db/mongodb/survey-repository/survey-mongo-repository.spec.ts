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

describe('Survey Mongo Repository', () => {
    describe('add()', () => {
        // Garante que o SurveyMongoRepository adicione uma nova pesquisa ao executar o método 'add' com sucesso
        test('Should add a survey on success', async () => {
            const sut = new SurveyMongoRepository(mongoDBAdapter)
            await sut.add(makeFakeSurveyCollection()[0])
            const survey = await surveyCollection.findOne({ question: 'any_question' })
            expect(survey).toBeTruthy()
            expect(survey._id).toBeTruthy()
        })
    })

    describe('loadAll()', () => {
        // Garante que o SurveyMongoRepository obtenha todas as pesquisas ao executar o método 'loadAll' com sucesso
        test('Should load all surveys on success', async () => {
            await surveyCollection.insertMany(makeFakeSurveyCollection())
            const sut = new SurveyMongoRepository(mongoDBAdapter)
            const surveys = await sut.loadAll()
            expect(surveys.length).toBe(2)
            expect(surveys[0].question).toBe('any_question')
            expect(surveys[1].question).toBe('other_question')
        })

        // Garante que o SurveyMongoRepository obtenha um array vazio quando não há registros na base ao executar o método 'loadAll' com sucesso
        test('Should load all surveys on success', async () => {
            const sut = new SurveyMongoRepository(mongoDBAdapter)
            const surveys = await sut.loadAll()
            expect(surveys.length).toBe(0)
        })
    })
})
