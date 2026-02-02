import { DbLoadSurveyResult } from '@data/usecases'
import { makeLoadSurveyResultRepository, mockLoadSurveyByIdRepository } from '@data/test'
import { mockSurveyResultModel, mockSurveyResultEmptyModel } from '@domain/test'
import MockDate from 'mockdate'

const surveyId = 'any_survey_id'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const makeSut = () => {
    const loadSurveyResultRepositoryStub = makeLoadSurveyResultRepository()
    const loadSurveyByIdRepositoryStub = mockLoadSurveyByIdRepository()
    const sut = new DbLoadSurveyResult(loadSurveyResultRepositoryStub, loadSurveyByIdRepositoryStub)
    return {
        sut,
        loadSurveyResultRepositoryStub,
        loadSurveyByIdRepositoryStub,
    }
}

describe('DbLoadSurveyResult Usecase', () => {
    // Garante que LoadSurveyResultRepository seja chamado com os valores corretos
    test('Should call LoadSurveyResultRepository with correct values', async () => {
        const { sut, loadSurveyResultRepositoryStub } = makeSut()
        const loadBySurveyIdSpy = jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')
        await sut.load(surveyId)
        expect(loadBySurveyIdSpy).toHaveBeenCalledWith(surveyId)
    })

    // Garante que DbLoadSurveyResult lance uma exceção se o LoadSurveyResultRepository lançar
    test('Should throw if LoadSurveyResultRepository throws', async () => {
        const { sut, loadSurveyResultRepositoryStub } = makeSut()
        jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId').mockImplementationOnce(() => { throw new Error() })
        const promise = sut.load(surveyId)
        await expect(promise).rejects.toThrow()
    })

    // Garante que chame o LoadSurveyByIdRepository se o LoadSurveyResultRepository retorne nulo
    test('Should call LoadSurveyByIdRepository if LoadSurveyResultRepository returns null', async () => {
        const { sut, loadSurveyResultRepositoryStub, loadSurveyByIdRepositoryStub } = makeSut()
        const loadByIdSpy = jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById')
        jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId').mockReturnValueOnce(Promise.resolve(null))
        await sut.load(surveyId)
        expect(loadByIdSpy).toHaveBeenCalledWith(surveyId)
    })

    // Garante que retorne o suerveyResultModel com todas as respostas com contagem 0 se LoadSurveyResultRepository retornar nulo.
    test('Should return suerveyResultModel with all answers with count 0 if LoadSurveyResultRepository returns null', async () => {
        const { sut, loadSurveyResultRepositoryStub } = makeSut()
        jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId').mockReturnValueOnce(Promise.resolve(null))
        const surveyResult = await sut.load(surveyId)
        expect(surveyResult).toEqual(mockSurveyResultEmptyModel())
    })

    // Garante que DbLoadSurveyResult retorne em caso de sucesso
    test('Should return a DbLoadSurveyResult on sucess', async () => {
        const { sut } = makeSut()
        const surveyResult = await sut.load(surveyId)
        expect(surveyResult).toEqual(mockSurveyResultModel())
    })
})
