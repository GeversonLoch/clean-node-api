import { mockSurveyResultModel } from '@domain/test'
import { LoadSurveyResultController } from '@presentation/controllers'
import { InvalidParamError } from '@presentation/errors'
import { forbidden, success } from '@presentation/helpers'
import {
    mockCheckSurveyById,
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

const mockRequest = (): LoadSurveyResultController.Request => ({
    accountId: 'any_account_id',
    surveyId: 'any_survey_id',
})

const makeSut = () => {
    const checkSurveyByIdStub = mockCheckSurveyById()
    const loadSurveyResultStub = mockLoadSurveyResult()
    const sut = new LoadSurveyResultController(checkSurveyByIdStub, loadSurveyResultStub)
    return {
        sut,
        checkSurveyByIdStub,
        loadSurveyResultStub,
    }
}

describe('LoadSurveyResult Controller', () => {
    // Garante chame CheckSurveyById com os valores corretos
    test('Should call CheckSurveyById with correct values', async () => {
        const { sut, checkSurveyByIdStub } = makeSut()
        const loadByIdSpy = jest.spyOn(checkSurveyByIdStub, 'checkById')
        const request = mockRequest()
        sut.handle(request)
        expect(loadByIdSpy).toHaveBeenCalledWith(request.surveyId)
    })

    // Garante que retorne 403 se CheckSurveyById retornar falso
    test('Should return 403 if CheckSurveyById returns false', async () => {
        const { sut, checkSurveyByIdStub } = makeSut()
        jest.spyOn(checkSurveyByIdStub, 'checkById').mockReturnValueOnce(Promise.resolve(false))
        const httpResponse = await sut.handle(mockRequest())
        expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
    })

    // Garante que retorne erro 500 se o CheckSurveyById lançar uma exceção
    test('Should return 500 if CheckSurveyById throws an exception', async () => {
        const { sut, checkSurveyByIdStub } = makeSut()
        jest.spyOn(checkSurveyByIdStub, 'checkById').mockImplementationOnce(() => {
            throw new Error()
        })
        const httpResponse = await sut.handle(mockRequest())
        expect(httpResponse).toEqual(mockInternalServerError())
    })

    // Garante chame LoadSurveyResult com os valores corretos
    test('Should call LoadSurveyResult with correct values', async () => {
        const { sut, loadSurveyResultStub } = makeSut()
        const loadSurveyResultSpy = jest.spyOn(loadSurveyResultStub, 'load')
        const request = mockRequest()
        await sut.handle(request)
        expect(loadSurveyResultSpy).toHaveBeenCalledWith(request.surveyId, request.accountId)
    })

    // Garante que retorne erro 500 se o LoadSurveyResult lançar uma exceção
    test('Should return 500 if LoadSurveyResult throws an exception', async () => {
        const { sut, loadSurveyResultStub } = makeSut()
        jest.spyOn(loadSurveyResultStub, 'load').mockImplementationOnce(() => {
            throw new Error()
        })
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
