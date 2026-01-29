import {
    IAddSurveyRepository,
    ILoadSurveyByIdRepository,
    ILoadSurveysRepository,
    ISaveSurveyResultRepository,
} from '@data/protocols'
import { ISurveyModel, ISurveyResultModel } from '@domain/models'
import { IAddSurveyParams, ISaveSurveyResultParams } from '@domain/usecases'
import {
    mockSurveyModel,
    mockSurveyModelCollection,
    mockSurveyResultModel,
} from '@domain/test'

export const mockAddSurveyRepository = (): IAddSurveyRepository => {
    class AddSurveyRepositoryStub implements IAddSurveyRepository {
        async add(surveyData: IAddSurveyParams): Promise<void> {
            return Promise.resolve()
        }
    }
    return new AddSurveyRepositoryStub()
}

export const mockLoadSurveyByIdRepository = (): ILoadSurveyByIdRepository => {
    class LoadSurveyByIdRepositoryStub implements ILoadSurveyByIdRepository {
        async loadById(id: string): Promise<ISurveyModel> {
            return Promise.resolve(mockSurveyModel())
        }
    }
    return new LoadSurveyByIdRepositoryStub()
}

export const mockLoadSurveysRepository = (): ILoadSurveysRepository => {
    class LoadSurveysRepositoryStub implements ILoadSurveysRepository {
        async loadAll(): Promise<ISurveyModel[]> {
            return Promise.resolve(mockSurveyModelCollection())
        }
    }
    return new LoadSurveysRepositoryStub()
}

export const makeSaveSurveyResultRepository = (): ISaveSurveyResultRepository => {
    class SaveSurveyResultRepositoryStub implements ISaveSurveyResultRepository {
        async save(surveyData: ISaveSurveyResultParams): Promise<ISurveyResultModel> {
            return Promise.resolve(mockSurveyResultModel())
        }
    }
    return new SaveSurveyResultRepositoryStub()
}
