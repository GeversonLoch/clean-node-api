import { IAccountModel, ISurveyModel } from '@domain/models'
import { SurveyResultMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { Collection, ObjectId } from 'mongodb'
import { mockAddSurveyParams, mockAddAccountExtraParams } from '@domain/test'
import MockDate from 'mockdate'

let surveyCollection: Collection
let surveyResultCollection: Collection
let accountCollection: Collection

beforeAll(async () => {
    await mongoDBAdapter.connect()
    MockDate.set(new Date())
})

beforeEach(async () => {
    surveyCollection = await mongoDBAdapter.getCollection('surveys')
    await surveyCollection.deleteMany({})
    surveyResultCollection = await mongoDBAdapter.getCollection('surveyResults')
    await surveyResultCollection.deleteMany({})
    accountCollection = await mongoDBAdapter.getCollection('accounts')
    await accountCollection.deleteMany({})
})

afterAll(async () => {
    await mongoDBAdapter.disconnect()
    MockDate.reset()
})

const mockSurveyCollection = async (): Promise<ISurveyModel> => {
    const result = await surveyCollection.insertOne(mockAddSurveyParams())
    const surveyDocument = await surveyCollection.findOne({ _id: result.insertedId })
    return mongoDBAdapter.map(surveyDocument)
}

const mockAccountCollection = async (): Promise<IAccountModel> => {
    const result = await accountCollection.insertOne(mockAddAccountExtraParams({ accessToken: 'any_token' }))
    const accountDocument = await accountCollection.findOne({ _id: result.insertedId })
    return mongoDBAdapter.map(accountDocument)
}

describe('Survey Result Mongo Repository', () => {
    describe('save()', () => {
        // Garante que o SurveyResultMongoRepository adicione um survey result ao executar o método 'save' com sucesso
        test('Should save a survey result if its new', async () => {
            const survey = await mockSurveyCollection()
            const account = await mockAccountCollection()
            const sut = new SurveyResultMongoRepository(mongoDBAdapter)
            const surveyResult = await sut.save({
                surveyId: survey.id,
                accountId: account.id,
                question: survey.question,
                answer: survey.answers[0].answer,
                date: new Date(),
            })
            expect(surveyResult).toBeTruthy()
            expect(new ObjectId(surveyResult.surveyId)).toEqual(new ObjectId(survey.id))
            expect(surveyResult.answers[0].count).toBe(1)
            expect(surveyResult.answers[0].percent).toBe(100)
            expect(surveyResult.answers[1].count).toBe(0)
            expect(surveyResult.answers[1].percent).toBe(0)
        })

        // Garante que o SurveyResultMongoRepository apenas atualize o survey result existente ao executar o método 'save' com sucesso
        test('Should update survey result if its not new', async () => {
            const survey = await mockSurveyCollection()
            const account = await mockAccountCollection()
            await surveyResultCollection.insertOne({
                surveyId: new ObjectId(survey.id),
                accountId: new ObjectId(account.id),
                question: survey.question,
                answer: survey.answers[0].answer,
                date: new Date(),
            })
            const sut = new SurveyResultMongoRepository(mongoDBAdapter)
            const surveyResult = await sut.save({
                surveyId: survey.id,
                accountId: account.id,
                question: survey.question,
                answer: survey.answers[1].answer,
                date: new Date(),
            })
            expect(surveyResult).toBeTruthy()
            expect(new ObjectId(surveyResult.surveyId)).toEqual(new ObjectId(survey.id))
            expect(surveyResult.answers[0].answer).toBe(survey.answers[1].answer)
            expect(surveyResult.answers[0].count).toBe(1)
            expect(surveyResult.answers[0].percent).toBe(100)
            expect(surveyResult.answers[1].count).toBe(0)
            expect(surveyResult.answers[1].percent).toBe(0)
        })
    })
})
