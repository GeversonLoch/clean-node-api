import { DbCheckSurveyById } from '@data/usecases'
import { mockCheckSurveyByIdRepository } from '@data/test'

const makeSut = () => {
    const checkSurveyByIdRepository = mockCheckSurveyByIdRepository()
    const sut = new DbCheckSurveyById(checkSurveyByIdRepository)
    return {
        sut,
        checkSurveyByIdRepository,
    }
}

describe('DbCheckSurveyById Usecase', () => {
    // Garante que CheckSurveyByIdRepository seja chamado com o id correto
    test('Should call CheckSurveyByIdRepository with correct id', async () => {
        const { sut, checkSurveyByIdRepository } = makeSut()
        const checkByIdSpy = jest.spyOn(checkSurveyByIdRepository, 'checkById')
        await sut.checkById('any_id')
        expect(checkByIdSpy).toHaveBeenCalledWith('any_id')
    })

    // Garante que DbCheckSurveyById retorne verdadeiro em caso de sucesso
    test('Should return true if CheckSurveyByIdRepository returns true', async () => {
        const { sut } = makeSut()
        const existsSurvey = await sut.checkById('any_id')
        expect(existsSurvey).toBe(true)
    })

    // Garante que DbCheckSurveyById retorne falso caso o survey não exista
    test('Should return false if CheckSurveyByIdRepository returns false', async () => {
        const { sut, checkSurveyByIdRepository } = makeSut()
        jest.spyOn(checkSurveyByIdRepository, 'checkById').mockReturnValueOnce(Promise.resolve(false))
        const existsSurvey = await sut.checkById('any_id')
        expect(existsSurvey).toBe(false)
    })

    // Garante que DbCheckSurveyById lance uma exceção se o CheckSurveyByIdRepository lançar
    test('Should throw if CheckSurveyByIdRepository throws', async () => {
        const { sut, checkSurveyByIdRepository } = makeSut()
        jest.spyOn(checkSurveyByIdRepository, 'checkById').mockImplementationOnce(() => { throw new Error() })
        const promise = sut.checkById('any_id')
        await expect(promise).rejects.toThrow()
    })
})
