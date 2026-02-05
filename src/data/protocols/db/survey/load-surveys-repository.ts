import { ILoadSurveys } from '@domain/usecases'

export interface ILoadSurveysRepository {
    loadAll(accountId: string): Promise<ILoadSurveysRepository.Result>
}

export namespace ILoadSurveysRepository {
    export type Result = ILoadSurveys.Result
}
