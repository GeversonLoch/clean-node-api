import { IHttpRequest } from '@presentation/protocols'
import { AddSurveyController } from '@presentation/controllers'
import { badRequest, noContent } from '@presentation/helpers'
import { mockAddSurveyParams } from '@domain/test'
import { mockAddSurvey, mockValidation } from '@presentation/test'
import { mockInternalServerError } from '@presentation/test'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const mockHttpRequest = (): IHttpRequest => ({
    body: mockAddSurveyParams(),
})

const makeSut = () => {
    const validationStub = mockValidation()
    const addSurveyStub = mockAddSurvey()
    const sut = new AddSurveyController(validationStub, addSurveyStub)
    return {
        sut,
        validationStub,
        addSurveyStub,
    }
}

describe('AddSurvey Controller', () => {
    // Garante que Validation seja chamado com os valores corretos.
    test('Should call Validation with correct values', async () => {
        const { sut, validationStub } = makeSut()
        const validationSpy = jest.spyOn(validationStub, 'validate')
        const request = mockHttpRequest()
        await sut.handle(request)
        expect(validationSpy).toHaveBeenCalledWith(request.body)
    })

    // Garante que retorne 400 se Validation retornar um erro.
    test('Should return 400 if Validation returns an error', async () => {
        const { sut, validationStub } = makeSut()
        jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error())
        const httpResponse = await sut.handle(mockHttpRequest())
        expect(httpResponse).toEqual(badRequest(new Error()))
    })

    // Garante que AddSurvey seja chamado com os valores corretos.
    test('Should call AddSurvey with correct values', async () => {
        const { sut, addSurveyStub } = makeSut()
        const addSpy = jest.spyOn(addSurveyStub, 'add')
        const request = mockHttpRequest()
        await sut.handle(request)
        expect(addSpy).toHaveBeenCalledWith(request.body)
    })

    // Garante que retorne erro 500 se o AddSurvey lançar uma exceção.
    test('Should return 500 if AddSurvey throws an exception', async () => {
        const { sut, addSurveyStub } = makeSut()
        jest.spyOn(addSurveyStub, 'add').mockImplementationOnce(() => { throw new Error() })
        const httpResponse = await sut.handle(mockHttpRequest())
        expect(httpResponse).toEqual(mockInternalServerError())
    })

    // Garante que retorne 204 em caso de sucesso.
    test('Should return 204 on success', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(mockHttpRequest())
        expect(httpResponse).toEqual(noContent())
    })
})
