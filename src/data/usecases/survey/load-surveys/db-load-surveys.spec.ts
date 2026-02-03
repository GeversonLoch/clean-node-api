import { DbLoadSurveys } from '@data/usecases'
import { mockSurveyModelCollection } from '@domain/test'
import { mockLoadSurveysRepository } from '@data/test'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const accountId = 'any_account_id'

const makeSut = () => {
    const loadSurveysRepositoryStub = mockLoadSurveysRepository()
    const sut = new DbLoadSurveys(loadSurveysRepositoryStub)
    return {
        sut,
        loadSurveysRepositoryStub,
    }
}

describe('DbLoadSurveys Usecase', () => {
    // Garante que LoadSurveysRepository seja chamado
    test('Should call LoadSurveysRepository', async () => {
        const { sut, loadSurveysRepositoryStub } = makeSut()
        const loadAllSpy = jest.spyOn(loadSurveysRepositoryStub, 'loadAll')
        await sut.load(accountId)
        expect(loadAllSpy).toHaveBeenCalledWith(accountId)
    })

    // Garante que DbLoadSurveys retorne uma lista de pesquisas em caso de sucesso
    test('Should return a list of Surveys on sucess', async () => {
        const { sut } = makeSut()
        const surveys = await sut.load(accountId)
        expect(surveys).toEqual(mockSurveyModelCollection())
    })

    // Garante que DbLoadSurveys lance uma exceção se o LoadSurveysRepository lançar
    test('Should throw if LoadSurveysRepository throws', async () => {
        const { sut, loadSurveysRepositoryStub } = makeSut()
        jest.spyOn(loadSurveysRepositoryStub, 'loadAll').mockImplementationOnce(() => { throw new Error() })
        const promise = sut.load(accountId)
        await expect(promise).rejects.toThrow()
    })
})
