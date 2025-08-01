import { IHttpRequest, IHttpResponse, IValidation } from '@presentation/protocols'
import { LoadSurveysController } from '@presentation/controllers'
import { badRequest, internalServerError, noContent } from '@presentation/helpers'
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

const makeValidation = (): IValidation => {
    class ValidationStub implements IValidation {
        validate(input: any): Error {
            return null
        }
    }
    return new ValidationStub()
}

const makeLoadSurveys = (): ILoadSurveys => {
    class LoadSurveysStub implements ILoadSurveys {
        async load(): Promise<ISurveyModel[]> {
            return Promise.resolve(makeFakeSurveys())
        }
    }
    return new LoadSurveysStub()
}

const makeSut = () => {
    const validationStub = makeValidation()
    const loadSurveysStub = makeLoadSurveys()
    const sut = new LoadSurveysController(validationStub, loadSurveysStub)
    return {
        sut,
        validationStub,
        loadSurveysStub,
    }
}

describe('LoadSurveys Controller', () => {
    // Garante que LoadSurveys seja chamado
    test('Should call LoadSurveys', async () => {
        const { sut, loadSurveysStub } = makeSut()
        const loadSpy = jest.spyOn(loadSurveysStub, 'load')
        await sut.handle({})
        expect(loadSpy).toHaveBeenCalled()
    })
})