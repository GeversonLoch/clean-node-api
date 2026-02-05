import { IAddSurvey, ICheckSurveyById, ILoadAnswersBySurvey, ILoadSurveyResult, ILoadSurveys, ISaveSurveyResult, ISaveSurveyResultParams } from '@domain/usecases'
import { mockSurveyModel, mockSurveyModelCollection, mockSurveyResultModel } from '@domain/test'
import { ISurveyModel, ISurveyResultModel } from '@domain/models'

export const mockAddSurvey = (): IAddSurvey => {
    class AddSurveyStub implements IAddSurvey {
        async add(surveyData: IAddSurvey.Params): Promise<void> {
            return Promise.resolve()
        }
    }
    return new AddSurveyStub()
}

export const mockLoadSurveys = (): ILoadSurveys => {
    class LoadSurveysStub implements ILoadSurveys {
        async load(accountId: string): Promise<ISurveyModel[]> {
            return Promise.resolve(mockSurveyModelCollection())
        }
    }
    return new LoadSurveysStub()
}

export const mockCheckSurveyById = (): ICheckSurveyById => {
    class CheckSurveyByIdStub implements ICheckSurveyById {
        async checkById(id: string): Promise<boolean> {
            return Promise.resolve(true)
        }
    }
    return new CheckSurveyByIdStub()
}

export const mockLoadAnswersBySurvey = (): ILoadAnswersBySurvey => {
    class LoadAnswersBySurveyStub implements ILoadAnswersBySurvey {
        async loadAnswers(id: string): Promise<ILoadAnswersBySurvey.Result> {
            const survey = mockSurveyModel()
            return Promise.resolve(survey.answers.map(a => a.answer))
        }
    }
    return new LoadAnswersBySurveyStub()
}

export const mockSaveSurveyResult = (): ISaveSurveyResult => {
    class SaveSurveyResultStub implements ISaveSurveyResult {
        async save(surveyData: ISaveSurveyResultParams): Promise<ISurveyResultModel> {
            return Promise.resolve(mockSurveyResultModel())
        }
    }
    return new SaveSurveyResultStub()
}

export const mockLoadSurveyResult = (): ILoadSurveyResult => {
    class LoadSurveyResultStub implements ILoadSurveyResult {
        async load(surveyId: string, accountId: string): Promise<ISurveyResultModel> {
            return Promise.resolve(mockSurveyResultModel())
        }
    }
    return new LoadSurveyResultStub()
}
