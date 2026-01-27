import { IAccountModel, ISurveyModel } from '@domain/models'
import { SurveyResultMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { Collection, ObjectId } from 'mongodb'
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

const makeFakeSurvey = async (): Promise<ISurveyModel> => {
    const result = await surveyCollection.insertOne({
        question: 'any_question',
        answers: [
            {
                answer: 'any_answer',
                image: 'any_image',
            },
            {
                answer: 'other_answer',
            },
        ],
        date: new Date(),
    })
    const surveyDocument = await surveyCollection.findOne({ _id: result.insertedId })
    return mongoDBAdapter.map(surveyDocument)
}

const makeAccountFake = async (): Promise<IAccountModel> => {
    const result = await accountCollection.insertOne({
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
        accessToken: 'any_token',
    })
    const accountDocument = await accountCollection.findOne({ _id: result.insertedId })
    return mongoDBAdapter.map(accountDocument)
}

describe('Survey Result Mongo Repository', () => {
    describe('save()', () => {
        // Garante que o SurveyResultMongoRepository adicione um survey result ao executar o método 'save' com sucesso
        test('Should save a survey result if its new', async () => {
            const survey = await makeFakeSurvey()
            const account = await makeAccountFake()
            const sut = new SurveyResultMongoRepository(mongoDBAdapter)
            const surveyResult = await sut.save({
                surveyId: survey.id,
                accountId: account.id,
                question: survey.question,
                answer: survey.answers[0].answer,
                date: new Date(),
            })
            expect(surveyResult).toBeTruthy()
            expect(surveyResult.id).toBeTruthy()
            expect(new ObjectId(surveyResult.surveyId)).toEqual(new ObjectId(survey.id))
            expect(new ObjectId(surveyResult.accountId)).toEqual(new ObjectId(account.id))
            expect(surveyResult.question).toBe(survey.question)
            expect(surveyResult.answer).toBe(survey.answers[0].answer)
            expect(surveyResult.date).toEqual(survey.date)
        })

        // Garante que o SurveyResultMongoRepository apenas atualize o survey result existente ao executar o método 'save' com sucesso
        test('Should update survey result if its not new', async () => {
            const survey = await makeFakeSurvey()
            const account = await makeAccountFake()
            const preInsert = await surveyResultCollection.insertOne({
                surveyId: survey.id,
                accountId: account.id,
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
            expect(new ObjectId(surveyResult.id)).toEqual(preInsert.insertedId)
            expect(surveyResult.answer).toBe(survey.answers[1].answer)
        })
    })
})
