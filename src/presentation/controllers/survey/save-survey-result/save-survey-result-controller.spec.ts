import { mockSaveSurveyResultParams, mockSurveyResultModel } from '@domain/test'
import { SaveSurveyResultController } from '@presentation/controllers'
import { InvalidParamError } from '@presentation/errors'
import { forbidden, success } from '@presentation/helpers'
import {
    mockInternalServerError,
    mockLoadSurveyById,
    mockSaveSurveyResult
} from '@presentation/test'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const mockRequest = (): SaveSurveyResultController.Request => ({
    surveyId: 'any_survey_id',
    accountId: 'any_account_id',
    question: 'any_question',
    answer: 'any_answer',
})

const makeSut = () => {
    const loadSurveyByIdStub = mockLoadSurveyById()
    const saveSurveyResultStub = mockSaveSurveyResult()
    const sut = new SaveSurveyResultController(loadSurveyByIdStub, saveSurveyResultStub)
    return {
        sut,
        loadSurveyByIdStub,
        saveSurveyResultStub,
    }
}

describe('SaveSurveyResult Controller', () => {
    // Garante chame LoadSurveyById com os valores corretos
    test('Should call LoadSurveyById with correct values', async () => {
        const { sut, loadSurveyByIdStub } = makeSut()
        const loadByIdSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
        const request = mockRequest()
        sut.handle(request)
        expect(loadByIdSpy).toHaveBeenCalledWith(request.surveyId)
    })

    // Garante que retorne 403 se LoadSurveyById retornar nulo
    test('Should return 403 if LoadSurveyById returns null', async () => {
        const { sut, loadSurveyByIdStub } = makeSut()
        jest.spyOn(loadSurveyByIdStub, 'loadById').mockReturnValueOnce(Promise.resolve(null))
        const httpResponse = await sut.handle(mockRequest())
        expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
    })

    // Garante que retorne erro 500 se o loadSurveyById lançar uma exceção.
    test('Should return 500 if loadSurveyById throws an exception', async () => {
        const { sut, loadSurveyByIdStub } = makeSut()
        jest.spyOn(loadSurveyByIdStub, 'loadById').mockImplementationOnce(() => { throw new Error() })
        const httpResponse = await sut.handle(mockRequest())
        expect(httpResponse).toEqual(mockInternalServerError())
    })

    // Garante que retorne 403 se a resposta enviada pelo client for uma resposta invalida
    test('Should return 403 if an invalid anwer is provided', async () => {
        const { sut } = makeSut()
        let request = mockRequest()
        request.answer = 'wrong_answer'
        const httpResponse = await sut.handle(request)
        expect(httpResponse).toEqual(forbidden(new InvalidParamError('answer')))
    })

    // Garante chame SaveSurveyResult com os valores corretos
    test('Should call SaveSurveyResult with correct values', async () => {
        const { sut, saveSurveyResultStub } = makeSut()
        const saveSpy = jest.spyOn(saveSurveyResultStub, 'save')
        await sut.handle(mockRequest())
        expect(saveSpy).toHaveBeenCalledWith(mockSaveSurveyResultParams())
    })

    // Garante que retorne erro 500 se o SaveSurveyResult lançar uma exceção.
    test('Should return 500 if SaveSurveyResult throws an exception', async () => {
        const { sut, saveSurveyResultStub } = makeSut()
        jest.spyOn(saveSurveyResultStub, 'save').mockImplementationOnce(() => { throw new Error() })
        const httpResponse = await sut.handle(mockRequest())
        expect(httpResponse).toEqual(mockInternalServerError())
    })

    // Garante que retorne 200 em caso de sucesso.
    test('Should return 200 on success', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(mockRequest())
        expect(httpResponse).toEqual(success(mockSurveyResultModel()))
    })
})
