import { SurveyMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { mockAddAccountParams, mockAddSurveyParams, mockAddSurveyParamsCollection } from '@domain/test'
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

const mockAccountId = async (): Promise<string> => {
    const res = await accountCollection.insertOne(mockAddAccountParams())
    return res.insertedId.toHexString()
}

const makeSut = (): SurveyMongoRepository => {
    return new SurveyMongoRepository(mongoDBAdapter)
}

describe('Survey Mongo Repository', () => {
    describe('add()', () => {
        // Garante que o SurveyMongoRepository adicione uma nova pesquisa ao executar o método 'add' com sucesso
        test('Should add a survey on success', async () => {
            const sut = makeSut()
            await sut.add(mockAddSurveyParams())
            const count = await surveyCollection.countDocuments()
            expect(count).toBe(1)
        })
    })

    describe('loadAll()', () => {
        // Garante que carregue todos as pesquisas em caso de sucesso
        test('Should load all surveys on success', async () => {
            const accountId = await mockAccountId()
            const addSurveyModels = mockAddSurveyParamsCollection()
            const result = await surveyCollection.insertMany(addSurveyModels)
            const survey = await surveyCollection.findOne({ _id: result.insertedIds[0] })
            await surveyResultCollection.insertOne({
                surveyId: survey._id,
                accountId: new ObjectId(accountId),
                answer: survey.answers[0].answer,
                date: new Date()
            })
            const sut = makeSut()
            const surveys = await sut.loadAll(accountId)
            expect(surveys.length).toBe(2)
            expect(surveys[0].id).toBeTruthy()
            expect(surveys[0].question).toBe(addSurveyModels[0].question)
            expect(surveys[0].didAnswer).toBe(true)
            expect(surveys[1].question).toBe(addSurveyModels[1].question)
            expect(surveys[1].didAnswer).toBe(false)
        })

        // Garante que carrege a lista vazia
        test('Should load empty list', async () => {
            const accountId = await mockAccountId()
            const sut = makeSut()
            const surveys = await sut.loadAll(accountId)
            expect(surveys.length).toBe(0)
        })
    })

    describe('loadById()', () => {
        // Garante que o SurveyMongoRepository obtenha todas as pesquisas ao executar o método 'loadAll' com sucesso
        test('Should load surveyById on success', async () => {
            const result = await surveyCollection.insertOne(mockAddSurveyParams())
            const sut = makeSut()
            const survey = await sut.loadById(result.insertedId.toHexString())
            expect(survey).toBeTruthy()
            expect(survey.id).toBeTruthy()
        })

        // Garante que retorne nulo se a pesquisa não existir
        test('Should return null if survey does not exists', async () => {
            const sut = makeSut()
            const fakeId = new ObjectId().toHexString()
            const survey = await sut.loadById(fakeId)
            expect(survey).toBeFalsy()
        })
    })

    describe('checkById()', () => {
        // Garante que retorne verdadeiro se a pesquisa existir
        test('Should load checkById on success', async () => {
            const result = await surveyCollection.insertOne(mockAddSurveyParams())
            const sut = makeSut()
            const existsSurvey = await sut.checkById(result.insertedId.toHexString())
            expect(existsSurvey).toBe(true)
        })

        // Garante que retorne falso se a pesquisa não existir
        test('Should return false if survey does not exists', async () => {
            const sut = makeSut()
            const fakeId = new ObjectId().toHexString()
            const existsSurvey = await sut.checkById(fakeId)
            expect(existsSurvey).toBe(false)
        })
    })
})
