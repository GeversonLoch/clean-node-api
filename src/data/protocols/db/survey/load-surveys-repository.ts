import { ISurveyModel } from '@domain/models'

export interface ILoadSurveysRepository {
    loadAll(): Promise<ISurveyModel[]>
}
