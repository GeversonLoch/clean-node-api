import {
    IAddSurveyRepository,
    ICheckSurveyByIdRepository,
    ILoadAnswersBySurveyRepository,
    ILoadSurveyResultRepository,
    ILoadSurveysRepository,
    ISaveSurveyResultRepository,
} from '@data/protocols'
import { ISurveyModel, ISurveyResultModel } from '@domain/models'
import { ISaveSurveyResultParams } from '@domain/usecases'
import {
    mockSurveyModel,
    mockSurveyModelCollection,
    mockSurveyResultModel,
} from '@domain/test'

export const mockAddSurveyRepository = (): IAddSurveyRepository => {
    class AddSurveyRepositoryStub implements IAddSurveyRepository {
        async add(surveyData: IAddSurveyRepository.Params): Promise<void> {
            return Promise.resolve()
        }
    }
    return new AddSurveyRepositoryStub()
}

export const mockCheckSurveyByIdRepository = (): ICheckSurveyByIdRepository => {
    class CheckSurveyByIdRepositoryStub implements ICheckSurveyByIdRepository {
        async checkById(id: string): Promise<boolean> {
            return Promise.resolve(true)
        }
    }
    return new CheckSurveyByIdRepositoryStub()
}

export const mockLoadSurveyByIdRepository = (): ILoadAnswersBySurveyRepository => {
    class LoadSurveyByIdRepositoryStub implements ILoadAnswersBySurveyRepository {
        async loadById(id: string): Promise<ILoadAnswersBySurveyRepository.Result> {
            return Promise.resolve(mockSurveyModel())
        }
    }
    return new LoadSurveyByIdRepositoryStub()
}

export const mockLoadSurveysRepository = (): ILoadSurveysRepository => {
    class LoadSurveysRepositoryStub implements ILoadSurveysRepository {
        async loadAll(accountId: string): Promise<ISurveyModel[]> {
            return Promise.resolve(mockSurveyModelCollection())
        }
    }
    return new LoadSurveysRepositoryStub()
}

export const makeSaveSurveyResultRepository = (): ISaveSurveyResultRepository => {
    class SaveSurveyResultRepositoryStub implements ISaveSurveyResultRepository {
        async save(surveyData: ISaveSurveyResultParams): Promise<void> {
            return Promise.resolve()
        }
    }
    return new SaveSurveyResultRepositoryStub()
}

export const makeLoadSurveyResultRepository = (): ILoadSurveyResultRepository => {
    class LoadSurveyResultRepositoryStub implements ILoadSurveyResultRepository {
        async loadBySurveyId(surveyId: string, accountId: string): Promise<ISurveyResultModel> {
            return Promise.resolve(mockSurveyResultModel())
        }
    }
    return new LoadSurveyResultRepositoryStub()
}
