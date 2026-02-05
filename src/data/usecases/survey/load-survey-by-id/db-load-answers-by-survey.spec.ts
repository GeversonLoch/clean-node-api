import { DbLoadAnswersBySurvey } from '@data/usecases'
import { mockLoadAnswersBySurveyRepository } from '@data/test'
import { mockSurveyModel } from '@domain/test'

const makeSut = () => {
    const loadAnswersBySurveyRepositoryStub = mockLoadAnswersBySurveyRepository()
    const sut = new DbLoadAnswersBySurvey(loadAnswersBySurveyRepositoryStub)
    return {
        sut,
        loadAnswersBySurveyRepositoryStub,
    }
}

describe('DbLoadAnswersBySurvey Usecase', () => {
    // Garante que LoadAnswersBySurveyRepository seja chamado com o Id correto
    test('Should call LoadAnswersBySurveyRepository with correct Id', async () => {
        const { sut, loadAnswersBySurveyRepositoryStub } = makeSut()
        const loadByIdSpy = jest.spyOn(loadAnswersBySurveyRepositoryStub, 'loadAnswers')
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

    // Garante que DbLoadAnswersBySurvey retorne uma coleção vazia caso LoadAnswersBySurveyRepository retorne nulo
    test('Should return empty collection if LoadAnswersBySurveyRepository returns null', async () => {
        const { sut, loadAnswersBySurveyRepositoryStub } = makeSut()
        jest.spyOn(loadAnswersBySurveyRepositoryStub, 'loadAnswers').mockReturnValueOnce(
            Promise.resolve([]),
        )
        const survey = await sut.loadAnswers('any_id')
        expect(survey).toEqual([])
    })

    // Garante que DbLoadAnswersBySurvey lance uma exceção se o LoadAnswersBySurveyRepository lançar
    test('Should throw if LoadAnswersBySurveyRepository throws', async () => {
        const { sut, loadAnswersBySurveyRepositoryStub } = makeSut()
        jest.spyOn(loadAnswersBySurveyRepositoryStub, 'loadAnswers').mockImplementationOnce(() => {
            throw new Error()
        })
        const promise = sut.loadAnswers('any_id')
        await expect(promise).rejects.toThrow()
    })
})
