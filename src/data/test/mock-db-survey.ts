import {
    IAddSurveyRepository,
    ICheckSurveyByIdRepository,
    ILoadAnswersBySurveyRepository,
    ILoadSurveyByIdRepository,
    ILoadSurveyResultRepository,
    ILoadSurveysRepository,
    ISaveSurveyResultRepository,
} from '@data/protocols'
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

export const mockLoadAnswersBySurveyRepository = (): ILoadAnswersBySurveyRepository => {
    class LoadAnswersBySurveyRepositoryStub implements ILoadAnswersBySurveyRepository {
        async loadAnswers(id: string): Promise<string[]> {
            const survey = mockSurveyModel()
            return Promise.resolve(survey.answers.map(a => a.answer))
        }
    }
    return new LoadAnswersBySurveyRepositoryStub()
}

export const mockLoadSurveyByIdRepository = (): ILoadSurveyByIdRepository => {
    class LoadSurveyByIdRepositoryStub implements ILoadSurveyByIdRepository {
        async loadById(id: string): Promise<ILoadSurveyByIdRepository.Result> {
            return Promise.resolve(mockSurveyModel())
        }
    }
    return new LoadSurveyByIdRepositoryStub()
}

export const mockLoadSurveysRepository = (): ILoadSurveysRepository => {
    class LoadSurveysRepositoryStub implements ILoadSurveysRepository {
        async loadAll(accountId: string): Promise<ILoadSurveysRepository.Result> {
            return Promise.resolve(mockSurveyModelCollection())
        }
    }
    return new LoadSurveysRepositoryStub()
}

export const makeSaveSurveyResultRepository = (): ISaveSurveyResultRepository => {
    class SaveSurveyResultRepositoryStub implements ISaveSurveyResultRepository {
        async save(surveyData: ISaveSurveyResultRepository.Params): Promise<void> {
            return Promise.resolve()
        }
    }
    return new SaveSurveyResultRepositoryStub()
}

export const makeLoadSurveyResultRepository = (): ILoadSurveyResultRepository => {
    class LoadSurveyResultRepositoryStub implements ILoadSurveyResultRepository {
        async loadBySurveyId(surveyId: string, accountId: string): Promise<ILoadSurveyResultRepository.Result> {
            return Promise.resolve(mockSurveyResultModel())
        }
    }
    return new LoadSurveyResultRepositoryStub()
}
