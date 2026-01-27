import { IAddSurveyRepository } from '@data/protocols'
import { DbAddSurvey } from '@data/usecases'
import { IAddSurveyParams } from '@domain/usecases'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const makeFakeSurveyData = (): IAddSurveyParams => ({
    answers: [
        {
            answer: 'any_answer',
            image: 'any_image',
        },
    ],
    question: 'any_question',
    date: new Date(),
})

const makeAddSurveyRepository = (): IAddSurveyRepository => {
    class AddSurveyRepositoryStub implements IAddSurveyRepository {
        async add(surveyData: IAddSurveyParams): Promise<void> {
            return Promise.resolve()
        }
    }
    return new AddSurveyRepositoryStub()
}

const makeSut = () => {
    const addSurveyRepositoryStub = makeAddSurveyRepository()
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
        const surveyData = makeFakeSurveyData()
        await sut.add(surveyData)
        expect(addSurveySpy).toHaveBeenCalledWith(surveyData)
    })

    // Garante que DbAddSurvey lance uma exceção se o AddSurveyRepository lançar
    test('Should throw if AddSurveyRepository throws', async () => {
        const { sut, addSurveyRepositoryStub } = makeSut()
        jest.spyOn(addSurveyRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
        const promise = sut.add(makeFakeSurveyData())
        await expect(promise).rejects.toThrow()
    })
})
