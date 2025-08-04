import { IHttpResponse } from '@presentation/protocols'
import { LoadSurveysController } from '@presentation/controllers'
import { internalServerError, noContent, success } from '@presentation/helpers'
import { ILoadSurveys } from '@domain/usecases'
import { ISurveyModel } from '@domain/models'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const makeFakeSurveys = (): ISurveyModel[] => {
    return [
        {
            id: 'any_id',
            question: 'any_question',
            answers: [
                {
                    answer: 'any_answer',
                    image: 'any_image',
                },
            ],
            date: new Date(),
        },
        {
            id: 'other_id',
            question: 'other_question',
            answers: [
                {
                    answer: 'other_answer',
                    image: 'other_image',
                },
            ],
            date: new Date(),
        },
    ]
}

const makeLoadSurveys = (): ILoadSurveys => {
    class LoadSurveysStub implements ILoadSurveys {
        async load(): Promise<ISurveyModel[]> {
            return Promise.resolve(makeFakeSurveys())
        }
    }
    return new LoadSurveysStub()
}

const makeFakeServerError = (): IHttpResponse => {
    let fakeError = new Error()
    fakeError.stack = 'any_stack'
    return internalServerError(fakeError)
}

const makeSut = () => {
    const loadSurveysStub = makeLoadSurveys()
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
        expect(httpResponse).toEqual(success(makeFakeSurveys()))
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
        jest.spyOn(loadSurveysStub, 'load').mockReturnValueOnce(Promise.reject(new Error()))
        const httpResponse = await sut.handle()
        expect(httpResponse).toEqual(makeFakeServerError())
    })
})
