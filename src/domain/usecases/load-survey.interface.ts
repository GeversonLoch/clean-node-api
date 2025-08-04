import { ISurveyModel } from '@domain/models'

export interface ILoadSurveys {
    load(params?: any): Promise<ISurveyModel[]>
}
