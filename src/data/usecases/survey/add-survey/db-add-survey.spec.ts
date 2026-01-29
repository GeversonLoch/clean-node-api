import { DbAddSurvey } from '@data/usecases'
import { mockAddSurveyRepository } from '@data/test'
import { mockAddSurveyParams } from '@domain/test'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const makeSut = () => {
    const addSurveyRepositoryStub = mockAddSurveyRepository()
    const sut = new DbAddSurvey(addSurveyRepositoryStub)
    return {
        sut,
        addSurveyRepositoryStub,
    }
}

describe('DbAddSurvey Usecase', () => {
    // Garante que AddSurveyRepository seja chamado com os valores corretos
    test('Should call AddSurveyRepository with correct values', async () => {
        const { sut, addSurveyRepositoryStub } = makeSut()
        const addSurveySpy = jest.spyOn(addSurveyRepositoryStub, 'add')
        const surveyParams = mockAddSurveyParams()
        await sut.add(surveyParams)
        expect(addSurveySpy).toHaveBeenCalledWith(surveyParams)
    })

    // Garante que DbAddSurvey lance uma exceção se o AddSurveyRepository lançar
    test('Should throw if AddSurveyRepository throws', async () => {
        const { sut, addSurveyRepositoryStub } = makeSut()
        jest.spyOn(addSurveyRepositoryStub, 'add').mockImplementationOnce(() => { throw new Error() })
        const promise = sut.add(mockAddSurveyParams())
        await expect(promise).rejects.toThrow()
    })
})
