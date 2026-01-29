import { DbSaveSurveyResult } from '@data/usecases'
import { mockSaveSurveyResultParams, mockSurveyResultModel } from '@domain/test'
import { makeSaveSurveyResultRepository } from '@data/test'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const makeSut = () => {
    const saveSurveyResultRepositoryStub = makeSaveSurveyResultRepository()
    const sut = new DbSaveSurveyResult(saveSurveyResultRepositoryStub)
    return {
        sut,
        saveSurveyResultRepositoryStub,
    }
}

describe('DbSaveSurveyResult Usecase', () => {
    // Garante que SaveSurveyResultRepository seja chamado com os valores corretos
    test('Should call SaveSurveyResultRepository with correct values', async () => {
        const { sut, saveSurveyResultRepositoryStub } = makeSut()
        const saveSurveySpy = jest.spyOn(saveSurveyResultRepositoryStub, 'save')
        const surveyResultPayload = mockSaveSurveyResultParams()
        await sut.save(surveyResultPayload)
        expect(saveSurveySpy).toHaveBeenCalledWith(surveyResultPayload)
    })

    // Garante que DbSaveSurveyResult lance uma exceção se o SaveSurveyResultRepository lançar
    test('Should throw if SaveSurveyResultRepository throws', async () => {
        const { sut, saveSurveyResultRepositoryStub } = makeSut()
        jest.spyOn(saveSurveyResultRepositoryStub, 'save').mockImplementationOnce(() => { throw new Error() })
        const promise = sut.save(mockSaveSurveyResultParams())
        await expect(promise).rejects.toThrow()
    })

    // Garante que DbSaveSurveyResult retorne em caso de sucesso
    test('Should return a DbSaveSurveyResult on sucess', async () => {
        const { sut } = makeSut()
        const surveyResult = await sut.save(mockSaveSurveyResultParams())
        expect(surveyResult).toEqual(mockSurveyResultModel())
    })
})
