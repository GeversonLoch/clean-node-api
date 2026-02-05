import { DbLoadAnswersBySurvey } from '@data/usecases'
import { mockLoadSurveyByIdRepository } from '@data/test'
import { mockSurveyModel } from '@domain/test'

const makeSut = () => {
    const loadSurveyByIdRepositoryStub = mockLoadSurveyByIdRepository()
    const sut = new DbLoadAnswersBySurvey(loadSurveyByIdRepositoryStub)
    return {
        sut,
        loadSurveyByIdRepositoryStub,
    }
}

describe('DbLoadAnswersBySurvey Usecase', () => {
    // Garante que LoadSurveyByIdRepository seja chamado com o Id correto
    test('Should call LoadSurveyByIdRepository with correct Id', async () => {
        const { sut, loadSurveyByIdRepositoryStub } = makeSut()
        const loadByIdSpy = jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById')
        await sut.loadAnswers('any_id')
        expect(loadByIdSpy).toHaveBeenCalledWith('any_id')
    })

    // Garante que DbLoadAnswersBySurvey retorne uma coleção de answers em caso de sucesso
    test('Should return answers on sucess', async () => {
        const { sut } = makeSut()
        const survey = await sut.loadAnswers('any_id')
        const surveyModel = mockSurveyModel()
        const answers = surveyModel.answers.map(a => a.answer)
        expect(survey).toEqual(answers)
    })

    // Garante que DbLoadAnswersBySurvey retorne uma coleção vazia caso LoadSurveyByIdRepository retorne nulo
    test('Should return empty collection if LoadSurveyByIdRepository returns null', async () => {
        const { sut, loadSurveyByIdRepositoryStub } = makeSut()
        jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve(null))
        const survey = await sut.loadAnswers('any_id')
        expect(survey).toEqual([])
    })

    // Garante que DbLoadAnswersBySurvey lance uma exceção se o LoadSurveyByIdRepository lançar
    test('Should throw if LoadSurveyByIdRepository throws', async () => {
        const { sut, loadSurveyByIdRepositoryStub } = makeSut()
        jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById').mockImplementationOnce(() => { throw new Error() })
        const promise = sut.loadAnswers('any_id')
        await expect(promise).rejects.toThrow()
    })
})
