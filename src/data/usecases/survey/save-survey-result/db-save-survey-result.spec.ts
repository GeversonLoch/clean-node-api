import { ISaveSurveyResultRepository } from '@data/protocols'
import { ISaveSurveyResultModel } from '@domain/usecases'
import { ISurveyResultModel } from '@domain/models'
import { DbSaveSurveyResult } from '@data/usecases'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const makeFakeSaveSurveyResultPayload = (): ISaveSurveyResultModel => ({
    surveyId: 'any_survey_id',
    accountId: 'any_account_id',
    question: 'any_question',
    answer: 'any_answer',
    date: new Date(),
})

const makeFakeSaveSurveyResultData = (): ISurveyResultModel => Object.assign({}, makeFakeSaveSurveyResultPayload(), {
    id: 'any_id',
})

const makeSaveSurveyResultRepository = (): ISaveSurveyResultRepository => {
    class SaveSurveyResultRepositoryStub implements ISaveSurveyResultRepository {
        async save(surveyData: ISaveSurveyResultModel): Promise<ISurveyResultModel> {
            return Promise.resolve(makeFakeSaveSurveyResultData())
        }
    }
    return new SaveSurveyResultRepositoryStub()
}

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
        const surveyResultPayload = makeFakeSaveSurveyResultPayload()
        await sut.save(surveyResultPayload)
        expect(saveSurveySpy).toHaveBeenCalledWith(surveyResultPayload)
    })

    // Garante que DbSaveSurveyResult lance uma exceção se o SaveSurveyResultRepository lançar
    test('Should throw if SaveSurveyResultRepository throws', async () => {
        const { sut, saveSurveyResultRepositoryStub } = makeSut()
        jest.spyOn(saveSurveyResultRepositoryStub, 'save').mockReturnValueOnce(Promise.reject(new Error()))
        const promise = sut.save(makeFakeSaveSurveyResultPayload())
        await expect(promise).rejects.toThrow()
    })

    // Garante que DbSaveSurveyResult retorne em caso de sucesso
    test('Should return a DbSaveSurveyResult on sucess', async () => {
        const { sut } = makeSut()
        const surveyResult = await sut.save(makeFakeSaveSurveyResultPayload())
        expect(surveyResult).toEqual(makeFakeSaveSurveyResultData())
    })
})
