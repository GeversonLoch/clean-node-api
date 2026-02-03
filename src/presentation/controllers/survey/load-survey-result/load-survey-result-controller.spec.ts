import { mockSurveyResultModel } from '@domain/test'
import { LoadSurveyResultController } from '@presentation/controllers'
import { InvalidParamError } from '@presentation/errors'
import { forbidden, success } from '@presentation/helpers'
import { IHttpRequest } from '@presentation/protocols'
import {
    mockInternalServerError,
    mockLoadSurveyById,
    mockLoadSurveyResult,
} from '@presentation/test'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const mockHttpRequest = (): IHttpRequest => ({
    accountId: 'any_account_id',
    params: {
        surveyId: 'any_survey_id',
    },
})

const makeSut = () => {
    const loadSurveyByIdStub = mockLoadSurveyById()
    const loadSurveyResultStub = mockLoadSurveyResult()
    const sut = new LoadSurveyResultController(loadSurveyByIdStub, loadSurveyResultStub)
    return {
        sut,
        loadSurveyByIdStub,
        loadSurveyResultStub,
    }
}

describe('LoadSurveyResult Controller', () => {
    // Garante chame LoadSurveyById com os valores corretos
    test('Should call LoadSurveyById with correct values', async () => {
        const { sut, loadSurveyByIdStub } = makeSut()
        const loadByIdSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
        const fakeRequest = mockHttpRequest()
        sut.handle(fakeRequest)
        expect(loadByIdSpy).toHaveBeenCalledWith(fakeRequest.params.surveyId)
    })

    // Garante que retorne 403 se LoadSurveyById retornar nulo
    test('Should return 403 if LoadSurveyById returns null', async () => {
        const { sut, loadSurveyByIdStub } = makeSut()
        jest.spyOn(loadSurveyByIdStub, 'loadById').mockReturnValueOnce(Promise.resolve(null))
        const httpResponse = await sut.handle(mockHttpRequest())
        expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
    })

    // Garante que retorne erro 500 se o loadSurveyById lançar uma exceção
    test('Should return 500 if loadSurveyById throws an exception', async () => {
        const { sut, loadSurveyByIdStub } = makeSut()
        jest.spyOn(loadSurveyByIdStub, 'loadById').mockImplementationOnce(() => {
            throw new Error()
        })
        const httpResponse = await sut.handle(mockHttpRequest())
        expect(httpResponse).toEqual(mockInternalServerError())
    })

    // Garante chame LoadSurveyResult com os valores corretos
    test('Should call LoadSurveyResult with correct values', async () => {
        const { sut, loadSurveyResultStub } = makeSut()
        const loadSurveyResultSpy = jest.spyOn(loadSurveyResultStub, 'load')
        const fakeRequest = mockHttpRequest()
        await sut.handle(fakeRequest)
        expect(loadSurveyResultSpy).toHaveBeenCalledWith(fakeRequest.params.surveyId, fakeRequest.accountId)
    })

    // Garante que retorne erro 500 se o LoadSurveyResult lançar uma exceção
    test('Should return 500 if LoadSurveyResult throws an exception', async () => {
        const { sut, loadSurveyResultStub } = makeSut()
        jest.spyOn(loadSurveyResultStub, 'load').mockImplementationOnce(() => {
            throw new Error()
        })
        const httpResponse = await sut.handle(mockHttpRequest())
        expect(httpResponse).toEqual(mockInternalServerError())
    })

    // Garante que retorne 200 em caso de sucesso.
    test('Should return 200 on success', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(mockHttpRequest())
        expect(httpResponse).toEqual(success(mockSurveyResultModel()))
    })
})
