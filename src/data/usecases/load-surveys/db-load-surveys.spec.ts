import { ILoadSurveysRepository } from '@data/protocols'
import { ISurveyModel } from '@domain/models'
import { DbLoadSurveys } from '@data/usecases'
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

const makeLoadSurveysRepository = (): ILoadSurveysRepository => {
    class LoadSurveysRepositoryStub implements ILoadSurveysRepository {
        async loadAll(): Promise<ISurveyModel[]> {
            return Promise.resolve(makeFakeSurveys())
        }
    }
    return new LoadSurveysRepositoryStub()
}

const makeSut = () => {
    const loadSurveysRepositoryStub = makeLoadSurveysRepository()
    const sut = new DbLoadSurveys(loadSurveysRepositoryStub)
    return {
        sut,
        loadSurveysRepositoryStub,
    }
}

describe('DbLoadSurveys Usecase', () => {
    // Garante que AddSurveyRepository seja chamado
    test('Should call LoadSurveysRepository', async () => {
        const { sut, loadSurveysRepositoryStub } = makeSut()
        const loadAllSpy = jest.spyOn(loadSurveysRepositoryStub, 'loadAll')
        await sut.load()
        expect(loadAllSpy).toHaveBeenCalled()
    })

    // Garante que DbLoadSurveys retorne uma lista de pesquisas em caso de sucesso
    test('Should return a list of Surveys on sucess', async () => {
        const { sut } = makeSut()
        const surveys = await sut.load()
        expect(surveys).toEqual(makeFakeSurveys())
    })
})
