import { IAddSurvey, ILoadSurveyById, ILoadSurveyResult, ILoadSurveys, ISaveSurveyResult, ISaveSurveyResultParams } from '@domain/usecases'
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

export const mockLoadSurveyById = (): ILoadSurveyById => {
    class LoadSurveyByIdStub implements ILoadSurveyById {
        async loadById(id: string): Promise<ISurveyModel> {
            return Promise.resolve(mockSurveyModel())
        }
    }
    return new LoadSurveyByIdStub()
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
