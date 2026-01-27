import { ISurveyModel, ISurveyResultModel } from '@domain/models'
import { ILoadSurveyById, ISaveSurveyResult, ISaveSurveyResultParams } from '@domain/usecases'
import { SaveSurveyResultController } from '@presentation/controllers'
import { InvalidParamError } from '@presentation/errors'
import { forbidden, internalServerError, success } from '@presentation/helpers'
import { IHttpRequest, IHttpResponse } from '@presentation/protocols'
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set(new Date())
})

afterAll(() => {
    MockDate.reset()
})

const makeFakeSaveSurveyResultPayload = (): ISaveSurveyResultParams => ({
    surveyId: 'any_survey_id',
    accountId: 'any_account_id',
    question: 'any_question',
    answer: 'any_answer',
    date: new Date(),
})

const makeFakeSaveSurveyResultData = (): ISurveyResultModel => Object.assign({}, makeFakeSaveSurveyResultPayload(), {
    id: 'any_id'
})

const makeFakeRequest = (): IHttpRequest => ({
    params: {
        surveyId: 'any_survey_id',
    },
    body: {
        question: 'any_question',
        answer: 'any_answer',
    },
    accountId: 'any_account_id',
})

const makeFakeSurvey = (): ISurveyModel => {
    return {
        id: 'any_survey_id',
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

const makeFakeServerError = (): IHttpResponse => {
    let fakeError = new Error()
    fakeError.stack = 'any_stack'
    return internalServerError(fakeError)
}

const makeLoadSurveyById = (): ILoadSurveyById => {
    class LoadSurveyByIdStub implements ILoadSurveyById {
        async loadById(id: string): Promise<ISurveyModel> {
            return Promise.resolve(makeFakeSurvey())
        }
    }
    return new LoadSurveyByIdStub()
}

const makeSaveSurveyResult = (): ISaveSurveyResult => {
    class SaveSurveyResultStub implements ISaveSurveyResult {
        async save(surveyData: ISaveSurveyResultParams): Promise<ISurveyResultModel> {
            return Promise.resolve(makeFakeSaveSurveyResultData())
        }
    }
    return new SaveSurveyResultStub()
}

const makeSut = () => {
    const loadSurveyByIdStub = makeLoadSurveyById()
    const saveSurveyResultStub = makeSaveSurveyResult()
    const sut = new SaveSurveyResultController(loadSurveyByIdStub, saveSurveyResultStub)
    return {
        sut,
        loadSurveyByIdStub,
        saveSurveyResultStub,
    }
}

describe('SaveSurveyResult Controller', () => {
    // Garante chame LoadSurveyById com os valores corretos
    test('Should call LoadSurveyById with correct values', async () => {
        const { sut, loadSurveyByIdStub } = makeSut()
        const loadByIdSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
        const fakeRequest = makeFakeRequest()
        sut.handle(fakeRequest)
        expect(loadByIdSpy).toHaveBeenCalledWith(fakeRequest.params.surveyId)
    })

    // Garante que retorne 403 se LoadSurveyById retornar nulo
    test('Should return 403 if LoadSurveyById returns null', async () => {
        const { sut, loadSurveyByIdStub } = makeSut()
        jest.spyOn(loadSurveyByIdStub, 'loadById').mockReturnValueOnce(Promise.resolve(null))
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
    })

    // Garante que retorne erro 500 se o loadSurveyByIdStub lançar uma exceção.
    test('Should return 500 if loadSurveyByIdStub throws an exception', async () => {
        const { sut, loadSurveyByIdStub } = makeSut()
        jest.spyOn(loadSurveyByIdStub, 'loadById').mockImplementationOnce(() => { throw new Error() })
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(makeFakeServerError())
    })

    // Garante que retorne 403 se a resposta enviada pelo client for uma resposta invalida
    test('Should return 403 if an invalid anwer is provided', async () => {
        const { sut } = makeSut()
        let fakeRequest = makeFakeRequest()
        fakeRequest.body.answer = 'wrong_answer'
        const httpResponse = await sut.handle(fakeRequest)
        expect(httpResponse).toEqual(forbidden(new InvalidParamError('answer')))
    })

    // Garante chame SaveSurveyResult com os valores corretos
    test('Should call SaveSurveyResult with correct values', async () => {
        const { sut, saveSurveyResultStub } = makeSut()
        const saveSpy = jest.spyOn(saveSurveyResultStub, 'save')
        await sut.handle(makeFakeRequest())
        expect(saveSpy).toHaveBeenCalledWith(makeFakeSaveSurveyResultPayload())
    })

    // Garante que retorne erro 500 se o SaveSurveyResult lançar uma exceção.
    test('Should return 500 if SaveSurveyResult throws an exception', async () => {
        const { sut, saveSurveyResultStub } = makeSut()
        jest.spyOn(saveSurveyResultStub, 'save').mockImplementationOnce(() => { throw new Error() })
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(makeFakeServerError())
    })

    // Garante que retorne 200 em caso de sucesso.
    test('Should return 200 on success', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(success(makeFakeSaveSurveyResultData()))
    })
})
