import { DbLoadSurveyById } from '@data/usecases'
import { mockLoadSurveyByIdRepository } from '@data/test'
import { mockSurveyModel } from '@domain/test'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const makeSut = () => {
    const loadSurveyByIdRepositoryStub = mockLoadSurveyByIdRepository()
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
        expect(survey).toEqual(mockSurveyModel())
    })

    // Garante que DbLoadSurveyById lance uma exceção se o LoadSurveyByIdRepository lançar
    test('Should throw if LoadSurveyByIdRepository throws', async () => {
        const { sut, loadSurveyByIdRepositoryStub } = makeSut()
        jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById').mockImplementationOnce(() => { throw new Error() })
        const promise = sut.loadById('any_id')
        await expect(promise).rejects.toThrow()
    })
})
