import { IHttpRequest, IHttpResponse, IValidation } from '@presentation/protocols'
import { AddSurveyController } from '@presentation/controllers'
import { badRequest, internalServerError, noContent } from '@presentation/helpers'
import { IAddSurvey } from '@domain/usecases'
import { IAddSurveyModel } from '@domain/models'

describe('AddSurvey Controller', () => {
    const makeFakeRequest = (): IHttpRequest => ({
        body: {
            question: 'any_question',
            answers: [
                {
                    image: 'any_image',
                    answer: 'any_answer',
                },
            ],
        },
    })

    const makeValidation = (): IValidation => {
        class ValidationStub implements IValidation {
            validate(input: any): Error {
                return null
            }
        }
        return new ValidationStub()
    }

    const makeAddSurvey = (): IAddSurvey => {
        class AddSurveyStub implements IAddSurvey {
            async add(surveyData: IAddSurveyModel): Promise<void> {
                return Promise.resolve()
            }
        }
        return new AddSurveyStub()
    }

    const makeFakeServerError = (): IHttpResponse => {
        let fakeError = new Error()
        fakeError.stack = 'any_stack'
        return internalServerError(fakeError)
    }

    const makeSut = () => {
        const validationStub = makeValidation()
        const addSurveyStub = makeAddSurvey()
        const sut = new AddSurveyController(validationStub, addSurveyStub)
        return {
            sut,
            validationStub,
            addSurveyStub,
        }
    }

    // Garante que Validation seja chamado com os valores corretos.
    test('Should call Validation with correct values', async () => {
        const { sut, validationStub } = makeSut()
        const validationSpy = jest.spyOn(validationStub, 'validate')
        const request = makeFakeRequest()
        await sut.handle(request)
        expect(validationSpy).toHaveBeenCalledWith(request.body)
    })

    // Garante que retorne 400 se Validation retornar um erro.
    test('Should return 400 if Validation returns an error', async () => {
        const { sut, validationStub } = makeSut()
        jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error())
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(badRequest(new Error()))
    })

    // Garante que AddSurvey seja chamado com os valores corretos.
    test('Should call AddSurvey with correct values', async () => {
        const { sut, addSurveyStub } = makeSut()
        const addSpy = jest.spyOn(addSurveyStub, 'add')
        const request = makeFakeRequest()
        await sut.handle(request)
        expect(addSpy).toHaveBeenCalledWith(request.body)
    })

    // Garante que retorne erro 500 se o AddSurvey lançar uma exceção.
    test('Should return 500 if AddSurvey throws an exception', async () => {
        const { sut, addSurveyStub } = makeSut()
        jest.spyOn(addSurveyStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(makeFakeServerError())
    })

    // Garante que retorne 204 em caso de sucesso.
    test('Should return 204 on success', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(noContent())
    })
})
