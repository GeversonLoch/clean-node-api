import { ISurveyModel } from '@domain/models'
import { DbLoadSurveyById } from '@data/usecases'
import { ILoadSurveyByIdRepository } from '@data/protocols'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const makeFakeSurvey = (): ISurveyModel => {
    return {
        id: 'any_id',
        question: 'any_question',
        answers: [
            {
                answer: 'any_answer',
                image: 'any_image',
            },
        ],
        date: new Date(),
    }
}

const makeLoadSurveyByIdRepository = (): ILoadSurveyByIdRepository => {
    class LoadSurveyByIdRepositoryStub implements ILoadSurveyByIdRepository {
        async loadById(id: string): Promise<ISurveyModel> {
            return Promise.resolve(makeFakeSurvey())
        }
    }
    return new LoadSurveyByIdRepositoryStub()
}

const makeSut = () => {
    const loadSurveyByIdRepositoryStub = makeLoadSurveyByIdRepository()
    const sut = new DbLoadSurveyById(loadSurveyByIdRepositoryStub)
    return {
        sut,
        loadSurveyByIdRepositoryStub,
    }
}

describe('DbLoadSurveyById Usecase', () => {
    // Garante que LoadSurveyByIdRepository seja chamado com o Id correto
    test('Should call LoadSurveyByIdRepository with correct Id', async () => {
        const { sut, loadSurveyByIdRepositoryStub } = makeSut()
        const loadByIdSpy = jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById')
        await sut.loadById('any_id')
        expect(loadByIdSpy).toHaveBeenCalledWith('any_id')
    })

    // Garante que DbLoadSurveyById retorne a pesquisa por id em caso de sucesso
    test('Should return a Survey on sucess', async () => {
        const { sut } = makeSut()
        const survey = await sut.loadById('any_id')
        expect(survey).toEqual(makeFakeSurvey())
    })

    // Garante que DbLoadSurveyById lance uma exceção se o LoadSurveyByIdRepository lançar
    test('Should throw if LoadSurveyByIdRepository throws', async () => {
        const { sut, loadSurveyByIdRepositoryStub } = makeSut()
        jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.reject(new Error()))
        const promise = sut.loadById('any_id')
        await expect(promise).rejects.toThrow()
    })
})
