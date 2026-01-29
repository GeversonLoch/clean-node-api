import { LoadSurveysController } from '@presentation/controllers'
import { noContent, success } from '@presentation/helpers'
import { mockSurveyModelCollection } from '@domain/test'
import { mockInternalServerError, mockLoadSurveys } from '@presentation/test'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const makeSut = () => {
    const loadSurveysStub = mockLoadSurveys()
    const sut = new LoadSurveysController(loadSurveysStub)
    return {
        sut,
        loadSurveysStub,
    }
}

describe('LoadSurveys Controller', () => {
    // Garante que LoadSurveys seja chamado.
    test('Should call LoadSurveys', async () => {
        const { sut, loadSurveysStub } = makeSut()
        const loadSpy = jest.spyOn(loadSurveysStub, 'load')
        await sut.handle()
        expect(loadSpy).toHaveBeenCalled()
    })

    // Garante que retorne 200 em caso de sucesso.
    test('Should return 200 on success', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle()
        expect(httpResponse).toEqual(success(mockSurveyModelCollection()))
    })

    // Garante que retorne 204 em caso de sucesso quando não registros salvos.
    test('Should return 204 if LoadSurveys returns empty', async () => {
        const { sut, loadSurveysStub } = makeSut()
        jest.spyOn(loadSurveysStub, 'load').mockReturnValueOnce(Promise.resolve([]))
        const httpResponse = await sut.handle()
        expect(httpResponse).toEqual(noContent())
    })

    // Garante que retorne erro 500 se o LoadSurveys lançar uma exceção.
    test('Should return 500 if LoadSurveys throws an exception', async () => {
        const { sut, loadSurveysStub } = makeSut()
        jest.spyOn(loadSurveysStub, 'load').mockImplementationOnce(() => { throw new Error() })
        const httpResponse = await sut.handle()
        expect(httpResponse).toEqual(mockInternalServerError())
    })
})
