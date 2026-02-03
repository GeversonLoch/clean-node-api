import { ISurveyModel } from '@domain/models'

export interface ILoadSurveysRepository {
    loadAll(accountId: string): Promise<ISurveyModel[]>
}
